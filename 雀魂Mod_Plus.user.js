// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.176
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
// @require      https://greasyfork.org/scripts/447737-majsoul-mod-plus/code/majsoul_mod_plus.js?version=1124756
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
        ! function(l) {
            var a;
            ! function(l) {
                l[l.none = 0] = 'none',
                    l[l['daoju'] = 1] = 'daoju',
                    l[l.gift = 2] = 'gift',
                    l[l['fudai'] = 3] = 'fudai',
                    l[l.view = 5] = 'view';
            }
            (a = l['EItemCategory'] || (l['EItemCategory'] = {}));
            var U = function(U) {
                    function z() {
                        var l = U.call(this, new ui['lobby']['bagUI']()) || this;
                        return l['container_top'] = null,
                            l['container_content'] = null,
                            l['locking'] = !1,
                            l.tabs = [],
                            l['page_item'] = null,
                            l['page_gift'] = null,
                            l['page_skin'] = null,
                            l['select_index'] = 0,
                            z.Inst = l,
                            l;
                    }
                    return __extends(z, U),
                        z.init = function() {
                            var l = this;
                            app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function(a) {
                                    var U = a['update'];
                                    U && U.bag && (l['update_data'](U.bag['update_items']), l['update_daily_gain_data'](U.bag));
                                }, null, !1)),
                                this['fetch']();
                        },
                        z['fetch'] = function() {
                            var a = this;
                            this['_item_map'] = {},
                                this['_daily_gain_record'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function(U, z) {
                                    if (U || z['error'])
                                        l['UIMgr'].Inst['showNetReqError']('fetchBagInfo', U, z);
                                    else {
                                        app.Log.log('背包信息：' + JSON['stringify'](z));
                                        var M = z.bag;

                                        if (M) {
                                            if (MMP.settings.setItems.setAllItems) {
                                                //设置全部道具
                                                var items = cfg.item_definition.item.map_;
                                                for (var id in items) {
                                                    if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                        for (let item of M["items"]) {
                                                            if (item.item_id == id) {
                                                                cfg.item_definition.item.get(item.item_id);
                                                                a._item_map[item.item_id] = {
                                                                    item_id: item.item_id,
                                                                    count: item.stack,
                                                                    category: items[item.item_id].category
                                                                };
                                                                break;
                                                            }
                                                        }
                                                    } else {
                                                        cfg.item_definition.item.get(id);
                                                        a._item_map[id] = {
                                                            item_id: id,
                                                            count: 1,
                                                            category: items[id].category
                                                        }; //获取物品列表并添加
                                                    }
                                                }


                                            } else {
                                                if (M['items'])
                                                    for (var g = 0; g < M['items']['length']; g++) {
                                                        var R = M['items'][g]['item_id'],
                                                            E = M['items'][g]['stack'],
                                                            C = cfg['item_definition'].item.get(R);
                                                        C && (a['_item_map'][R] = {
                                                            item_id: R,
                                                            count: E,
                                                            category: C['category']
                                                        }, 1 == C['category'] && 3 == C.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                            item_id: R
                                                        }, function() {}));
                                                    }
                                                if (M['daily_gain_record'])
                                                    for (var B = M['daily_gain_record'], g = 0; g < B['length']; g++) {
                                                        var w = B[g]['limit_source_id'];
                                                        a['_daily_gain_record'][w] = {};
                                                        var L = B[g]['record_time'];
                                                        a['_daily_gain_record'][w]['record_time'] = L;
                                                        var c = B[g]['records'];
                                                        if (c)
                                                            for (var h = 0; h < c['length']; h++)
                                                                a['_daily_gain_record'][w][c[h]['item_id']] = c[h]['count'];
                                                    }
                                            }
                                        }
                                    }
                                });
                        },
                        z['find_item'] = function(l) {
                            var a = this['_item_map'][l];
                            return a ? {
                                    item_id: a['item_id'],
                                    category: a['category'],
                                    count: a['count']
                                } :
                                null;
                        },
                        z['get_item_count'] = function(l) {
                            var a = this['find_item'](l);
                            if (a)
                                return a['count'];
                            if ('100001' == l) {
                                for (var U = 0, z = 0, M = GameMgr.Inst['free_diamonds']; z < M['length']; z++) {
                                    var g = M[z];
                                    GameMgr.Inst['account_numerical_resource'][g] && (U += GameMgr.Inst['account_numerical_resource'][g]);
                                }
                                for (var R = 0, E = GameMgr.Inst['paid_diamonds']; R < E['length']; R++) {
                                    var g = E[R];
                                    GameMgr.Inst['account_numerical_resource'][g] && (U += GameMgr.Inst['account_numerical_resource'][g]);
                                }
                                return U;
                            }
                            if ('100004' == l) {
                                for (var C = 0, B = 0, w = GameMgr.Inst['free_pifuquans']; B < w['length']; B++) {
                                    var g = w[B];
                                    GameMgr.Inst['account_numerical_resource'][g] && (C += GameMgr.Inst['account_numerical_resource'][g]);
                                }
                                for (var L = 0, c = GameMgr.Inst['paid_pifuquans']; L < c['length']; L++) {
                                    var g = c[L];
                                    GameMgr.Inst['account_numerical_resource'][g] && (C += GameMgr.Inst['account_numerical_resource'][g]);
                                }
                                return C;
                            }
                            return '100002' == l ? GameMgr.Inst['account_data'].gold : 0;
                        },
                        z['find_items_by_category'] = function(l) {
                            var a = [];
                            for (var U in this['_item_map'])
                                this['_item_map'][U]['category'] == l && a.push({
                                    item_id: this['_item_map'][U]['item_id'],
                                    category: this['_item_map'][U]['category'],
                                    count: this['_item_map'][U]['count']
                                });
                            return a;
                        },
                        z['update_data'] = function(a) {
                            for (var U = 0; U < a['length']; U++) {
                                var z = a[U]['item_id'],
                                    M = a[U]['stack'];
                                if (M > 0) {
                                    this['_item_map']['hasOwnProperty'](z['toString']()) ? this['_item_map'][z]['count'] = M : this['_item_map'][z] = {
                                        item_id: z,
                                        count: M,
                                        category: cfg['item_definition'].item.get(z)['category']
                                    };
                                    var g = cfg['item_definition'].item.get(z);
                                    1 == g['category'] && 3 == g.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                            item_id: z
                                        }, function() {}),
                                        5 == g['category'] && (this['new_bag_item_ids'].push(z), this['new_zhuangban_item_ids'][z] = 1);
                                } else if (this['_item_map']['hasOwnProperty'](z['toString']())) {
                                    var R = cfg['item_definition'].item.get(z);
                                    R && 5 == R['category'] && l['UI_Sushe']['on_view_remove'](z),
                                        this['_item_map'][z] = 0,
                                        delete this['_item_map'][z];
                                }
                            }
                            this.Inst && this.Inst['when_data_change']();
                            for (var U = 0; U < a['length']; U++) {
                                var z = a[U]['item_id'];
                                if (this['_item_listener']['hasOwnProperty'](z['toString']()))
                                    for (var E = this['_item_listener'][z], C = 0; C < E['length']; C++)
                                        E[C].run();
                            }
                            for (var U = 0; U < this['_all_item_listener']['length']; U++)
                                this['_all_item_listener'][U].run();
                        },
                        z['update_daily_gain_data'] = function(l) {
                            var a = l['update_daily_gain_record'];
                            if (a)
                                for (var U = 0; U < a['length']; U++) {
                                    var z = a[U]['limit_source_id'];
                                    this['_daily_gain_record'][z] || (this['_daily_gain_record'][z] = {});
                                    var M = a[U]['record_time'];
                                    this['_daily_gain_record'][z]['record_time'] = M;
                                    var g = a[U]['records'];
                                    if (g)
                                        for (var R = 0; R < g['length']; R++)
                                            this['_daily_gain_record'][z][g[R]['item_id']] = g[R]['count'];
                                }
                        },
                        z['get_item_daily_record'] = function(l, a) {
                            return this['_daily_gain_record'][l] ? this['_daily_gain_record'][l]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][l]['record_time']) ? this['_daily_gain_record'][l][a] ? this['_daily_gain_record'][l][a] : 0 : 0 : 0 : 0;
                        },
                        z['add_item_listener'] = function(l, a) {
                            this['_item_listener']['hasOwnProperty'](l['toString']()) || (this['_item_listener'][l] = []),
                                this['_item_listener'][l].push(a);
                        },
                        z['remove_item_listener'] = function(l, a) {
                            var U = this['_item_listener'][l];
                            if (U)
                                for (var z = 0; z < U['length']; z++)
                                    if (U[z] === a) {
                                        U[z] = U[U['length'] - 1],
                                            U.pop();
                                        break;
                                    }
                        },
                        z['add_all_item_listener'] = function(l) {
                            this['_all_item_listener'].push(l);
                        },
                        z['remove_all_item_listener'] = function(l) {
                            for (var a = this['_all_item_listener'], U = 0; U < a['length']; U++)
                                if (a[U] === l) {
                                    a[U] = a[a['length'] - 1],
                                        a.pop();
                                    break;
                                }
                        },
                        z['removeAllBagNew'] = function() {
                            this['new_bag_item_ids'] = [];
                        },
                        z['removeZhuangBanNew'] = function(l) {
                            for (var a = 0, U = l; a < U['length']; a++) {
                                var z = U[a];
                                delete this['new_zhuangban_item_ids'][z];
                            }
                        },
                        z['prototype']['have_red_point'] = function() {
                            return !1;
                        },
                        z['prototype']['onCreate'] = function() {
                            var a = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    a['locking'] || a.hide(Laya['Handler']['create'](a, function() {
                                        return a['closeHandler'] ? (a['closeHandler'].run(), a['closeHandler'] = null, void 0) : (l['UI_Lobby'].Inst['enable'] = !0, void 0);
                                    }));
                                }, null, !1),
                                this['container_content'] = this.me['getChildByName']('content');
                            for (var U = function(l) {
                                    z.tabs.push(z['container_content']['getChildByName']('tabs')['getChildByName']('btn' + l)),
                                        z.tabs[l]['clickHandler'] = Laya['Handler']['create'](z, function() {
                                            a['select_index'] != l && a['on_change_tab'](l);
                                        }, null, !1);
                                }, z = this, M = 0; 4 > M; M++)
                                U(M);
                            this['page_item'] = new l['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                                this['page_gift'] = new l['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                                this['page_skin'] = new l['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin'));
                        },
                        z['prototype'].show = function(a, U) {
                            var z = this;
                            void 0 === a && (a = 0),
                                void 0 === U && (U = null),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                this['closeHandler'] = U,
                                l['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200),
                                l['UIBase']['anim_alpha_in'](this['container_content'], {
                                    y: 30
                                }, 200),
                                Laya['timer'].once(300, this, function() {
                                    z['locking'] = !1;
                                }),
                                this['on_change_tab'](a),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                3 != a && this['page_skin']['when_update_data']();
                        },
                        z['prototype'].hide = function(a) {
                            var U = this;
                            this['locking'] = !0,
                                l['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 200),
                                l['UIBase']['anim_alpha_out'](this['container_content'], {
                                    y: 30
                                }, 200),
                                Laya['timer'].once(300, this, function() {
                                    U['locking'] = !1,
                                        U['enable'] = !1,
                                        a && a.run();
                                });
                        },
                        z['prototype']['onDisable'] = function() {
                            this['page_skin']['close'](),
                                this['page_item']['close'](),
                                this['page_gift']['close']();
                        },
                        z['prototype']['on_change_tab'] = function(l) {
                            this['select_index'] = l;
                            for (var U = 0; U < this.tabs['length']; U++)
                                this.tabs[U].skin = game['Tools']['localUISrc'](l == U ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[U]['getChildAt'](0)['color'] = l == U ? '#d9b263' : '#8cb65f';
                            switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, l) {
                                case 0:
                                    this['page_item'].show(a['daoju']);
                                    break;
                                case 1:
                                    this['page_gift'].show();
                                    break;
                                case 2:
                                    this['page_item'].show(a.view);
                                    break;
                                case 3:
                                    this['page_skin'].show();
                            }
                        },
                        z['prototype']['when_data_change'] = function() {
                            this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                                this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                        },
                        z['prototype']['on_skin_change'] = function() {
                            this['page_skin']['when_update_data']();
                        },
                        z['prototype']['clear_desktop_btn_redpoint'] = function() {
                            this.tabs[3]['getChildByName']('redpoint')['visible'] = !1;
                        },
                        z['_item_map'] = {},
                        z['_item_listener'] = {},
                        z['_all_item_listener'] = [],
                        z['_daily_gain_record'] = {},
                        z['new_bag_item_ids'] = [],
                        z['new_zhuangban_item_ids'] = {},
                        z.Inst = null,
                        z;
                }
                (l['UIBase']);
            l['UI_Bag'] = U;
        }
        (uiscript || (uiscript = {}));





        // 修改牌桌上角色
        ! function(l) {
            var a = function() {
                    function a() {
                        var a = this;
                        this.urls = [],
                            this['link_index'] = -1,
                            this['connect_state'] = l['EConnectState'].none,
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
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function(l) {
                                if (MMP.settings.sendGame == true) {
                                    (GM_xmlhttpRequest({
                                        method: 'post',
                                        url: MMP.settings.sendGameURL,
                                        data: JSON.stringify(l),
                                        onload: function(msg) {
                                            console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(l));
                                        }
                                    }));
                                }
                                app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](l)),
                                    a['loaded_player_count'] = l['ready_id_list']['length'],
                                    a['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](a['loaded_player_count'], a['real_player_count']);
                            }));
                    }
                    return Object['defineProperty'](a, 'Inst', {
                            get: function() {
                                return null == this['_Inst'] ? this['_Inst'] = new a() : this['_Inst'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        a['prototype']['OpenConnect'] = function(a, U, z, M) {
                            var g = this;
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                                l['Scene_Lobby'].Inst && l['Scene_Lobby'].Inst['active'] && (l['Scene_Lobby'].Inst['active'] = !1),
                                l['Scene_Huiye'].Inst && l['Scene_Huiye'].Inst['active'] && (l['Scene_Huiye'].Inst['active'] = !1),
                                this['Close'](),
                                view['BgmListMgr']['stopBgm'](),
                                this['is_ob'] = !1,
                                Laya['timer'].once(500, this, function() {
                                    g.url = '',
                                        g['token'] = a,
                                        g['game_uuid'] = U,
                                        g['server_location'] = z,
                                        GameMgr.Inst['ingame'] = !0,
                                        GameMgr.Inst['mj_server_location'] = z,
                                        GameMgr.Inst['mj_game_token'] = a,
                                        GameMgr.Inst['mj_game_uuid'] = U,
                                        g['playerreconnect'] = M,
                                        g['_setState'](l['EConnectState']['tryconnect']),
                                        g['load_over'] = !1,
                                        g['loaded_player_count'] = 0,
                                        g['real_player_count'] = 0,
                                        g['lb_index'] = 0,
                                        g['_fetch_gateway'](0);
                                }),
                                Laya['timer'].loop(300000, this, this['reportInfo']);
                        },
                        a['prototype']['reportInfo'] = function() {
                            this['connect_state'] == l['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                                client_type: 'web',
                                route_type: 'game',
                                route_index: l['LobbyNetMgr']['root_id_lst'][l['LobbyNetMgr'].Inst['choosed_index']],
                                route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                                connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                                reconnect_count: this['_report_reconnect_count']
                            });
                        },
                        a['prototype']['Close'] = function() {
                            this['load_over'] = !1,
                                app.Log.log('MJNetMgr close'),
                                this['_setState'](l['EConnectState'].none),
                                app['NetAgent']['Close2MJ'](),
                                this.url = '',
                                Laya['timer']['clear'](this, this['reportInfo']);
                        },
                        a['prototype']['_OnConnent'] = function(a) {
                            app.Log.log('MJNetMgr _OnConnent event:' + a),
                                a == Laya['Event']['CLOSE'] || a == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == l['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == l['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](l['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](l['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](2008)), l['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == l['EConnectState']['reconnecting'] && this['_Reconnect']()) : a == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == l['EConnectState']['tryconnect'] || this['connect_state'] == l['EConnectState']['reconnecting']) && ((this['connect_state'] = l['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](l['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                        },
                        a['prototype']['_Reconnect'] = function() {
                            var a = this;
                            l['LobbyNetMgr'].Inst['connect_state'] == l['EConnectState'].none || l['LobbyNetMgr'].Inst['connect_state'] == l['EConnectState']['disconnect'] ? this['_setState'](l['EConnectState']['disconnect']) : l['LobbyNetMgr'].Inst['connect_state'] == l['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](l['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function() {
                                a['connect_state'] == l['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + a['reconnect_count']), app['NetAgent']['connect2MJ'](a.url, Laya['Handler']['create'](a, a['_OnConnent'], null, !1), 'local' == a['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                            }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                        },
                        a['prototype']['_try_to_linknext'] = function() {
                            this['link_index']++,
                                this.url = '',
                                app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                                this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? l['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](l['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && l['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                        },
                        a['prototype']['GetAuthData'] = function() {
                            return {
                                account_id: GameMgr.Inst['account_id'],
                                token: this['token'],
                                game_uuid: this['game_uuid'],
                                gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                            };
                        },
                        a['prototype']['_fetch_gateway'] = function(a) {
                            var U = this;
                            if (l['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= l['LobbyNetMgr'].Inst.urls['length'])
                                return uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && l['Scene_MJ'].Inst['ForceOut'](), this['_setState'](l['EConnectState'].none), void 0;
                            this.urls = [],
                                this['link_index'] = -1,
                                app.Log.log('mj _fetch_gateway retry_count:' + a);
                            var z = function(z) {
                                    var M = JSON['parse'](z);
                                    if (app.Log.log('mj _fetch_gateway func_success data = ' + z), M['maintenance'])
                                        U['_setState'](l['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && l['Scene_MJ'].Inst['ForceOut']();
                                    else if (M['servers'] && M['servers']['length'] > 0) {
                                        for (var g = M['servers'], R = l['Tools']['deal_gateway'](g), E = 0; E < R['length']; E++)
                                            U.urls.push({
                                                name: '___' + E,
                                                url: R[E]
                                            });
                                        U['link_index'] = -1,
                                            U['_try_to_linknext']();
                                    } else
                                        1 > a ? Laya['timer'].once(1000, U, function() {
                                            U['_fetch_gateway'](a + 1);
                                        }) : l['LobbyNetMgr'].Inst['polling_connect'] ? (U['lb_index']++, U['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](60)), U['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && l['Scene_MJ'].Inst['ForceOut'](), U['_setState'](l['EConnectState'].none));
                                },
                                M = function() {
                                    app.Log.log('mj _fetch_gateway func_error'),
                                        1 > a ? Laya['timer'].once(500, U, function() {
                                            U['_fetch_gateway'](a + 1);
                                        }) : l['LobbyNetMgr'].Inst['polling_connect'] ? (U['lb_index']++, U['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](58)), U['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || l['Scene_MJ'].Inst['ForceOut'](), U['_setState'](l['EConnectState'].none));
                                },
                                g = function(l) {
                                    var a = new Laya['HttpRequest']();
                                    a.once(Laya['Event']['COMPLETE'], U, function(l) {
                                            z(l);
                                        }),
                                        a.once(Laya['Event']['ERROR'], U, function() {
                                            M();
                                        });
                                    var g = [];
                                    g.push('If-Modified-Since'),
                                        g.push('0'),
                                        l += '?service=ws-game-gateway',
                                        l += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                        l += '&location=' + U['server_location'],
                                        l += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                        a.send(l, '', 'get', 'text', g),
                                        app.Log.log('mj _fetch_gateway func_fetch url = ' + l);
                                };
                            l['LobbyNetMgr'].Inst['polling_connect'] ? g(l['LobbyNetMgr'].Inst.urls[this['lb_index']]) : g(l['LobbyNetMgr'].Inst['lb_url']);
                        },
                        a['prototype']['_setState'] = function(a) {
                            this['connect_state'] = a,
                                GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (a == l['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : a == l['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : a == l['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : a == l['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : a == l['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                        },
                        a['prototype']['_ConnectSuccess'] = function() {
                            var a = this;
                            app.Log.log('MJNetMgr _ConnectSuccess '),
                                this['load_over'] = !1,
                                app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function(U, z) {
                                    if (U || z['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('authGame', U, z), l['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                    else {
                                        app.Log.log('麻将桌验证通过：' + JSON['stringify'](z)),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                        // 强制打开便捷提示
                                        if (MMP.settings.setbianjietishi) {
                                            z['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                        }
                                        // END
                                        // 增加对mahjong-helper的兼容
                                        // 发送游戏对局
                                        if (MMP.settings.sendGame == true) {
                                            GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(z),
                                                onload: function(msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(z));
                                                }
                                            });
                                        }
                                        //END
                                        var M = [],
                                            g = 0;
                                        view['DesktopMgr']['player_link_state'] = z['state_list'];
                                        var R = l['Tools']['strOfLocalization'](2003),
                                            E = z['game_config'].mode,
                                            C = view['ERuleMode']['Liqi4'];
                                        E.mode < 10 ? (C = view['ERuleMode']['Liqi4'], a['real_player_count'] = 4) : E.mode < 20 && (C = view['ERuleMode']['Liqi3'], a['real_player_count'] = 3);
                                        for (var B = 0; B < a['real_player_count']; B++)
                                            M.push(null);
                                        E['extendinfo'] && (R = l['Tools']['strOfLocalization'](2004)),
                                            E['detail_rule'] && E['detail_rule']['ai_level'] && (1 === E['detail_rule']['ai_level'] && (R = l['Tools']['strOfLocalization'](2003)), 2 === E['detail_rule']['ai_level'] && (R = l['Tools']['strOfLocalization'](2004)));
                                        for (var w = l['GameUtility']['get_default_ai_skin'](), L = l['GameUtility']['get_default_ai_character'](), B = 0; B < z['seat_list']['length']; B++) {
                                            var c = z['seat_list'][B];
                                            if (0 == c) {
                                                M[B] = {
                                                    nickname: R,
                                                    avatar_id: w,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: L,
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
                                                        M[B].avatar_id = skin.id;
                                                        M[B].character.charid = skin.character_id;
                                                        M[B].character.skin = skin.id;
                                                    }
                                                }
                                                if (MMP.settings.showServer == true) {
                                                    M[B].nickname = '[BOT]' + M[B].nickname;
                                                }
                                            } else {
                                                g++;
                                                for (var h = 0; h < z['players']['length']; h++)
                                                    if (z['players'][h]['account_id'] == c) {
                                                        M[B] = z['players'][h];
                                                        //修改牌桌上人物头像及皮肤
                                                        if (M[B].account_id == GameMgr.Inst.account_id) {
                                                            M[B].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                            M[B].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                            M[B].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                            M[B].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                            M[B].title = GameMgr.Inst.account_data.title;
                                                            if (MMP.settings.nickname != '') {
                                                                M[B].nickname = MMP.settings.nickname;
                                                            }
                                                        } else if (MMP.settings.randomPlayerDefSkin && (M[B].avatar_id == 400101 || M[B].avatar_id == 400201)) {
                                                            //玩家如果用了默认皮肤也随机换
                                                            let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                            let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                            let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                            // 修复皮肤错误导致无法进入游戏的bug
                                                            if (skin.id != 400000 && skin.id != 400001) {
                                                                M[B].avatar_id = skin.id;
                                                                M[B].character.charid = skin.character_id;
                                                                M[B].character.skin = skin.id;
                                                            }
                                                        }
                                                        if (MMP.settings.showServer == true) {
                                                            let server = game.Tools.get_zone_id(M[B].account_id);
                                                            if (server == 1) {
                                                                M[B].nickname = '[CN]' + M[B].nickname;
                                                            } else if (server == 2) {
                                                                M[B].nickname = '[JP]' + M[B].nickname;
                                                            } else if (server == 3) {
                                                                M[B].nickname = '[EN]' + M[B].nickname;
                                                            } else {
                                                                M[B].nickname = '[??]' + M[B].nickname;
                                                            }
                                                        }
                                                        // END
                                                        break;
                                                    }
                                            }
                                        }
                                        for (var B = 0; B < a['real_player_count']; B++)
                                            null == M[B] && (M[B] = {
                                                account: 0,
                                                nickname: l['Tools']['strOfLocalization'](2010),
                                                avatar_id: w,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: L,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: w,
                                                    is_upgraded: !1
                                                }
                                            });
                                        a['loaded_player_count'] = z['ready_id_list']['length'],
                                            a['_AuthSuccess'](M, z['is_game_start'], z['game_config']['toJSON']());
                                    }
                                });
                        },
                        a['prototype']['_AuthSuccess'] = function(a, U, z) {
                            var M = this;
                            view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function() {
                                app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                    view['DesktopMgr'].Inst['Reset'](),
                                    view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                    uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                    app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                        round_id: view['DesktopMgr'].Inst['round_id'],
                                        step: view['DesktopMgr'].Inst['current_step']
                                    }, function(a, U) {
                                        a || U['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', a, U), l['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](U)), U['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](2011)), l['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](U['game_restore'])));
                                    });
                            })) : l['Scene_MJ'].Inst['openMJRoom'](z, a, Laya['Handler']['create'](this, function() {
                                view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](z)), a, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](M, function() {
                                    U ? Laya['timer']['frameOnce'](10, M, function() {
                                        app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                            view['DesktopMgr'].Inst['Reset'](),
                                            view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                                round_id: '-1',
                                                step: 1000000
                                            }, function(a, U) {
                                                app.Log.log('syncGame ' + JSON['stringify'](U)),
                                                    a || U['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', a, U), l['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), M['_PlayerReconnectSuccess'](U));
                                            });
                                    }) : Laya['timer']['frameOnce'](10, M, function() {
                                        app.Log.log('send enterGame'),
                                            view['DesktopMgr'].Inst['Reset'](),
                                            view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function(a, U) {
                                                a || U['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', a, U), l['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), M['_EnterGame'](U), view['DesktopMgr'].Inst['fetchLinks']());
                                            });
                                    });
                                }));
                            }), Laya['Handler']['create'](this, function(l) {
                                return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * l);
                            }, null, !1));
                        },
                        a['prototype']['_EnterGame'] = function(a) {
                            app.Log.log('正常进入游戏: ' + JSON['stringify'](a)),
                                a['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](2011)), l['Scene_MJ'].Inst['GameEnd']()) : a['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](a['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                        },
                        a['prototype']['_PlayerReconnectSuccess'] = function(a) {
                            app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](a)),
                                a['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](2011)), l['Scene_MJ'].Inst['GameEnd']()) : a['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](a['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](l['Tools']['strOfLocalization'](2012)), l['Scene_MJ'].Inst['ForceOut']());
                        },
                        a['prototype']['_SendDebugInfo'] = function() {},
                        a['prototype']['OpenConnectObserve'] = function(a, U) {
                            var z = this;
                            this['is_ob'] = !0,
                                uiscript['UI_Loading'].Inst.show('enter_mj'),
                                this['Close'](),
                                view['AudioMgr']['StopMusic'](),
                                Laya['timer'].once(500, this, function() {
                                    z['server_location'] = U,
                                        z['ob_token'] = a,
                                        z['_setState'](l['EConnectState']['tryconnect']),
                                        z['lb_index'] = 0,
                                        z['_fetch_gateway'](0);
                                });
                        },
                        a['prototype']['_ConnectSuccessOb'] = function() {
                            var a = this;
                            app.Log.log('MJNetMgr _ConnectSuccessOb '),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                    token: this['ob_token']
                                }, function(U, z) {
                                    U || z['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', U, z), l['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](z)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function(U, z) {
                                        if (U || z['error'])
                                            uiscript['UIMgr'].Inst['showNetReqError']('startObserve', U, z), l['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                        else {
                                            var M = z.head,
                                                g = M['game_config'].mode,
                                                R = [],
                                                E = l['Tools']['strOfLocalization'](2003),
                                                C = view['ERuleMode']['Liqi4'];
                                            g.mode < 10 ? (C = view['ERuleMode']['Liqi4'], a['real_player_count'] = 4) : g.mode < 20 && (C = view['ERuleMode']['Liqi3'], a['real_player_count'] = 3);
                                            for (var B = 0; B < a['real_player_count']; B++)
                                                R.push(null);
                                            g['extendinfo'] && (E = l['Tools']['strOfLocalization'](2004)),
                                                g['detail_rule'] && g['detail_rule']['ai_level'] && (1 === g['detail_rule']['ai_level'] && (E = l['Tools']['strOfLocalization'](2003)), 2 === g['detail_rule']['ai_level'] && (E = l['Tools']['strOfLocalization'](2004)));
                                            for (var w = l['GameUtility']['get_default_ai_skin'](), L = l['GameUtility']['get_default_ai_character'](), B = 0; B < M['seat_list']['length']; B++) {
                                                var c = M['seat_list'][B];
                                                if (0 == c)
                                                    R[B] = {
                                                        nickname: E,
                                                        avatar_id: w,
                                                        level: {
                                                            id: '10101'
                                                        },
                                                        level3: {
                                                            id: '20101'
                                                        },
                                                        character: {
                                                            charid: L,
                                                            level: 0,
                                                            exp: 0,
                                                            views: [],
                                                            skin: w,
                                                            is_upgraded: !1
                                                        }
                                                    };
                                                else
                                                    for (var h = 0; h < M['players']['length']; h++)
                                                        if (M['players'][h]['account_id'] == c) {
                                                            R[B] = M['players'][h];
                                                            break;
                                                        }
                                            }
                                            for (var B = 0; B < a['real_player_count']; B++)
                                                null == R[B] && (R[B] = {
                                                    account: 0,
                                                    nickname: l['Tools']['strOfLocalization'](2010),
                                                    avatar_id: w,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: L,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: w,
                                                        is_upgraded: !1
                                                    }
                                                });
                                            a['_StartObSuccuess'](R, z['passed'], M['game_config']['toJSON'](), M['start_time']);
                                        }
                                    }));
                                });
                        },
                        a['prototype']['_StartObSuccuess'] = function(a, U, z, M) {
                            var g = this;
                            view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function() {
                                app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                    view['DesktopMgr'].Inst['Reset'](),
                                    uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](M, U);
                            })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), l['Scene_MJ'].Inst['openMJRoom'](z, a, Laya['Handler']['create'](this, function() {
                                view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](z)), a, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](g, function() {
                                    uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                        Laya['timer'].once(1000, g, function() {
                                            GameMgr.Inst['EnterMJ'](),
                                                uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](M, U);
                                        });
                                }));
                            }), Laya['Handler']['create'](this, function(l) {
                                return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * l);
                            }, null, !1)));
                        },
                        a['_Inst'] = null,
                        a;
                }
                ();
            l['MJNetMgr'] = a;
        }
        (game || (game = {}));





        // 读取战绩
        ! function(l) {
            var a = function(a) {
                    function U() {
                        var l = a.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                        return l['account_id'] = 0,
                            l['origin_x'] = 0,
                            l['origin_y'] = 0,
                            l.root = null,
                            l['title'] = null,
                            l['level'] = null,
                            l['btn_addfriend'] = null,
                            l['btn_report'] = null,
                            l['illust'] = null,
                            l.name = null,
                            l['detail_data'] = null,
                            l['achievement_data'] = null,
                            l['locking'] = !1,
                            l['tab_info4'] = null,
                            l['tab_info3'] = null,
                            l['tab_note'] = null,
                            l['tab_img_dark'] = '',
                            l['tab_img_chosen'] = '',
                            l['player_data'] = null,
                            l['tab_index'] = 1,
                            l['game_category'] = 1,
                            l['game_type'] = 1,
                            U.Inst = l,
                            l;
                    }
                    return __extends(U, a),
                        U['prototype']['onCreate'] = function() {
                            var a = this;
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                                this.root = this.me['getChildByName']('root'),
                                this['origin_x'] = this.root.x,
                                this['origin_y'] = this.root.y,
                                this['container_info'] = this.root['getChildByName']('container_info'),
                                this['title'] = new l['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                                this.name = this['container_info']['getChildByName']('name'),
                                this['level'] = new l['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                                this['detail_data'] = new l['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                                this['achievement_data'] = new l['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                                this['illust'] = new l['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                                this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                                this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    a['btn_addfriend']['visible'] = !1,
                                        a['btn_report'].x = 343,
                                        app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                            target_id: a['account_id']
                                        }, function() {});
                                }, null, !1),
                                this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                                this['btn_report']['clickHandler'] = new Laya['Handler'](this, function() {
                                    l['UI_Report_Nickname'].Inst.show(a['account_id']);
                                }),
                                this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    a['locking'] || a['close']();
                                }, null, !1),
                                this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    a['close']();
                                }, null, !1),
                                this.note = new l['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                                this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                                this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    a['locking'] || 1 != a['tab_index'] && a['changeMJCategory'](1);
                                }, null, !1),
                                this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                                this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    a['locking'] || 2 != a['tab_index'] && a['changeMJCategory'](2);
                                }, null, !1),
                                this['tab_note'] = this.root['getChildByName']('tab_note'),
                                this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    a['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? l['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : a['container_info']['visible'] && (a['container_info']['visible'] = !1, a['tab_info4'].skin = a['tab_img_dark'], a['tab_info3'].skin = a['tab_img_dark'], a['tab_note'].skin = a['tab_img_chosen'], a['tab_index'] = 3, a.note.show()));
                                }, null, !1),
                                this['locking'] = !1;
                        },
                        U['prototype'].show = function(a, U, z, M) {
                            var g = this;
                            void 0 === U && (U = 1),
                                void 0 === z && (z = 2),
                                void 0 === M && (M = 1),
                                GameMgr.Inst['BehavioralStatistics'](14),
                                this['account_id'] = a,
                                this['enable'] = !0,
                                this['locking'] = !0,
                                this.root.y = this['origin_y'],
                                this['player_data'] = null,
                                l['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    g['locking'] = !1;
                                })),
                                this['detail_data']['reset'](),
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                    account_id: a
                                }, function(U, z) {
                                    U || z['error'] ? l['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', U, z) : l['UI_Shilian']['now_season_info'] && 1001 == l['UI_Shilian']['now_season_info']['season_id'] && 3 != l['UI_Shilian']['get_cur_season_state']() ? (g['detail_data']['setData'](z), g['changeMJCategory'](g['tab_index'], g['game_category'], g['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                        account_id: a
                                    }, function(a, U) {
                                        a || U['error'] ? l['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', a, U) : (z['season_info'] = U['season_info'], g['detail_data']['setData'](z), g['changeMJCategory'](g['tab_index'], g['game_category'], g['game_type']));
                                    });
                                }),
                                this.note['init_data'](a),
                                this['refreshBaseInfo'](),
                                this['btn_report']['visible'] = a != GameMgr.Inst['account_id'],
                                this['tab_index'] = U,
                                this['game_category'] = z,
                                this['game_type'] = M,
                                this['container_info']['visible'] = !0,
                                this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_note'].skin = this['tab_img_dark'],
                                this.note['close'](),
                                this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                                this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                        },
                        U['prototype']['refreshBaseInfo'] = function() {
                            var a = this;
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
                                }, function(U, z) {
                                    if (U || z['error'])
                                        l['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', U, z);
                                    else {
                                        var M = z['account'];
                                        //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                        if (M.account_id == GameMgr.Inst.account_id) {
                                            M.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                                M.title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                M.nickname = MMP.settings.nickname;
                                            }
                                        }
                                        //end
                                        a['player_data'] = M,
                                            game['Tools']['SetNickname'](a.name, M),
                                            a['title'].id = game['Tools']['titleLocalization'](M['account_id'], M['title']),
                                            a['level'].id = M['level'].id,
                                            a['level'].id = a['player_data'][1 == a['tab_index'] ? 'level' : 'level3'].id,
                                            a['level'].exp = a['player_data'][1 == a['tab_index'] ? 'level' : 'level3']['score'],
                                            a['illust'].me['visible'] = !0,
                                            a['account_id'] == GameMgr.Inst['account_id'] ? a['illust']['setSkin'](M['avatar_id'], 'waitingroom') : a['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](M['avatar_id']), 'waitingroom'),
                                            game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], a['account_id']) && a['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(a['account_id']) ? (a['btn_addfriend']['visible'] = !0, a['btn_report'].x = 520) : (a['btn_addfriend']['visible'] = !1, a['btn_report'].x = 343),
                                            a.note.sign['setSign'](M['signature']),
                                            a['achievement_data'].show(!1, M['achievement_count']);
                                    }
                                });
                        },
                        U['prototype']['changeMJCategory'] = function(l, a, U) {
                            void 0 === a && (a = 2),
                                void 0 === U && (U = 1),
                                this['tab_index'] = l,
                                this['container_info']['visible'] = !0,
                                this['detail_data']['changeMJCategory'](l, a, U),
                                this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                                this['tab_note'].skin = this['tab_img_dark'],
                                this.note['close'](),
                                this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                        },
                        U['prototype']['close'] = function() {
                            var a = this;
                            this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), l['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                a['locking'] = !1,
                                    a['enable'] = !1;
                            }))));
                        },
                        U['prototype']['onEnable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                        },
                        U['prototype']['onDisable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                                this['detail_data']['close'](),
                                this['illust']['clear'](),
                                Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                        },
                        U.Inst = null,
                        U;
                }
                (l['UIBase']);
            l['UI_OtherPlayerInfo'] = a;
        }
        (uiscript || (uiscript = {}));




        // 宿舍相关
        ! function(l) {
            var a = function() {
                    function a(a, z) {
                        var M = this;
                        this['_scale'] = 1,
                            this['during_move'] = !1,
                            this['mouse_start_x'] = 0,
                            this['mouse_start_y'] = 0,
                            this.me = a,
                            this['container_illust'] = z,
                            this['illust'] = this['container_illust']['getChildByName']('illust'),
                            this['container_move'] = a['getChildByName']('move'),
                            this['container_move'].on('mousedown', this, function() {
                                M['during_move'] = !0,
                                    M['mouse_start_x'] = M['container_move']['mouseX'],
                                    M['mouse_start_y'] = M['container_move']['mouseY'];
                            }),
                            this['container_move'].on('mousemove', this, function() {
                                M['during_move'] && (M.move(M['container_move']['mouseX'] - M['mouse_start_x'], M['container_move']['mouseY'] - M['mouse_start_y']), M['mouse_start_x'] = M['container_move']['mouseX'], M['mouse_start_y'] = M['container_move']['mouseY']);
                            }),
                            this['container_move'].on('mouseup', this, function() {
                                M['during_move'] = !1;
                            }),
                            this['container_move'].on('mouseout', this, function() {
                                M['during_move'] = !1;
                            }),
                            this['btn_close'] = a['getChildByName']('btn_close'),
                            this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                M['locking'] || M['close']();
                            }, null, !1),
                            this['scrollbar'] = a['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                            this['scrollbar'].init(new Laya['Handler'](this, function(l) {
                                M['_scale'] = 1 * (1 - l) + 0.5,
                                    M['illust']['scaleX'] = M['_scale'],
                                    M['illust']['scaleY'] = M['_scale'],
                                    M['scrollbar']['setVal'](l, 0);
                            })),
                            this['dongtai_kaiguan'] = new l['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function() {
                                U.Inst['illust']['resetSkin']();
                            }), new Laya['Handler'](this, function(l) {
                                U.Inst['illust']['playAnim'](l);
                            })),
                            this['dongtai_kaiguan']['setKaiguanPos'](-462, -536);
                    }
                    return Object['defineProperty'](a['prototype'], 'scale', {
                            get: function() {
                                return this['_scale'];
                            },
                            set: function(l) {
                                this['_scale'] = l,
                                    this['scrollbar']['setVal'](1 - (l - 0.5) / 1, 0);
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        a['prototype'].show = function(a) {
                            var z = this;
                            this['locking'] = !0,
                                this['when_close'] = a,
                                this['illust_start_x'] = this['illust'].x,
                                this['illust_start_y'] = this['illust'].y,
                                this['illust_center_x'] = this['illust'].x + 984 - 446,
                                this['illust_center_y'] = this['illust'].y + 11 - 84,
                                this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                                this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                                this['container_illust']['getChildByName']('btn')['visible'] = !1,
                                U.Inst['stopsay'](),
                                this['scale'] = 1,
                                Laya['Tween'].to(this['illust'], {
                                    x: this['illust_center_x'],
                                    y: this['illust_center_y']
                                }, 200),
                                l['UIBase']['anim_pop_out'](this['btn_close'], null),
                                this['during_move'] = !1,
                                Laya['timer'].once(250, this, function() {
                                    z['locking'] = !1;
                                }),
                                this.me['visible'] = !0,
                                this['dongtai_kaiguan']['refresh'](U.Inst['illust']['skin_id']);
                        },
                        a['prototype']['close'] = function() {
                            var a = this;
                            this['locking'] = !0,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                                this['container_illust']['getChildByName']('btn')['visible'] = !0,
                                Laya['Tween'].to(this['illust'], {
                                    x: this['illust_start_x'],
                                    y: this['illust_start_y'],
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200),
                                l['UIBase']['anim_pop_hide'](this['btn_close'], null),
                                Laya['timer'].once(250, this, function() {
                                    a['locking'] = !1,
                                        a.me['visible'] = !1,
                                        a['when_close'].run();
                                });
                        },
                        a['prototype'].move = function(l, a) {
                            var U = this['illust'].x + l,
                                z = this['illust'].y + a;
                            U < this['illust_center_x'] - 600 ? U = this['illust_center_x'] - 600 : U > this['illust_center_x'] + 600 && (U = this['illust_center_x'] + 600),
                                z < this['illust_center_y'] - 1200 ? z = this['illust_center_y'] - 1200 : z > this['illust_center_y'] + 800 && (z = this['illust_center_y'] + 800),
                                this['illust'].x = U,
                                this['illust'].y = z;
                        },
                        a;
                }
                (),
                U = function(U) {
                    function z() {
                        var l = U.call(this, new ui['lobby']['susheUI']()) || this;
                        return l['contianer_illust'] = null,
                            l['illust'] = null,
                            l['illust_rect'] = null,
                            l['container_name'] = null,
                            l['label_name'] = null,
                            l['label_cv'] = null,
                            l['label_cv_title'] = null,
                            l['container_page'] = null,
                            l['container_look_illust'] = null,
                            l['page_select_character'] = null,
                            l['page_visit_character'] = null,
                            l['origin_illust_x'] = 0,
                            l['chat_id'] = 0,
                            l['container_chat'] = null,
                            l['_select_index'] = 0,
                            l['sound_channel'] = null,
                            l['chat_block'] = null,
                            l['illust_showing'] = !0,
                            z.Inst = l,
                            l;
                    }
                    return __extends(z, U),
                        z.init = function(a) {
                            var U = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function(M, g) {
                                    if (M || g['error'])
                                        l['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', M, g);
                                    else {
                                        if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](g)), g = JSON['parse'](JSON['stringify'](g)), g['main_character_id'] && g['characters']) {
                                            // if (U['characters'] = [], g['characters'])
                                            // for (var R = 0; R < g['characters']['length']; R++)
                                            // U['characters'].push(g['characters'][R]);
                                            // if (U['skin_map'] = {}, g['skins'])
                                            // for (var R = 0; R < g['skins']['length']; R++)
                                            // U['skin_map'][g['skins'][R]] = 1;
                                            // U['main_character_id'] = g['main_character_id'];
                                            //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                            fake_data.char_id = g.main_character_id;
                                            for (let i = 0; i < g.characters.length; i++) {
                                                if (g.characters[i].charid == g.main_character_id) {
                                                    if (g.characters[i].extra_emoji !== undefined) {
                                                        fake_data.emoji = g.characters[i].extra_emoji;
                                                    } else {
                                                        fake_data.emoji = [];
                                                    }
                                                    fake_data.skin = g.skins[i];
                                                    fake_data.exp = g.characters[i].exp;
                                                    fake_data.level = g.characters[i].level;
                                                    fake_data.is_upgraded = g.characters[i].is_upgraded;
                                                    break;
                                                }
                                            }
                                            U.characters = [];

                                            for (let j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                                let id = 200000 + j;
                                                let skin = 400001 + j * 100;
                                                let emoji = [];
                                                cfg.character.emoji.getGroup(id).forEach((element) => {
                                                    emoji.push(element.sub_id);
                                                });
                                                U.characters.push({
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
                                            U.main_character_id = MMP.settings.character;
                                            GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                            uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                            U.star_chars = MMP.settings.star_chars;
                                            g.character_sort = MMP.settings.star_chars;
                                            // END
                                        } else
                                            U['characters'] = [], U['characters'].push({
                                                charid: '200001',
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: '400101',
                                                is_upgraded: !1,
                                                extra_emoji: [],
                                                rewarded_level: []
                                            }), U['characters'].push({
                                                charid: '200002',
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: '400201',
                                                is_upgraded: !1,
                                                extra_emoji: [],
                                                rewarded_level: []
                                            }), U['skin_map']['400101'] = 1, U['skin_map']['400201'] = 1, U['main_character_id'] = '200001';
                                        if (U['send_gift_count'] = 0, U['send_gift_limit'] = 0, g['send_gift_count'] && (U['send_gift_count'] = g['send_gift_count']), g['send_gift_limit'] && (U['send_gift_limit'] = g['send_gift_limit']), g['finished_endings'])
                                            for (var R = 0; R < g['finished_endings']['length']; R++)
                                                U['finished_endings_map'][g['finished_endings'][R]] = 1;
                                        if (g['rewarded_endings'])
                                            for (var R = 0; R < g['rewarded_endings']['length']; R++)
                                                U['rewarded_endings_map'][g['rewarded_endings'][R]] = 1;
                                        if (U['star_chars'] = [], g['character_sort'] && (U['star_chars'] = g['character_sort']), z['hidden_characters_map'] = {}, g['hidden_characters'])
                                            for (var E = 0, C = g['hidden_characters']; E < C['length']; E++) {
                                                var B = C[E];
                                                z['hidden_characters_map'][B] = 1;
                                            }
                                        a.run();
                                    }
                                }),
                                // app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (a, z) {
                                // if (a || z['error'])
                                // l['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', a, z);
                                // else {
                                // U['using_commonview_index'] = z.use,
                                //  U['commonViewList'] = [[], [], [], [], [], [], [], []];
                                // var M = z['views'];
                                // if (M)
                                // for (var g = 0; g < M['length']; g++) {
                                // var R = M[g]['values'];
                                //  R && (U['commonViewList'][M[g]['index']] = R);
                                //            }
                                U.commonViewList = MMP.settings.commonViewList;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst["load_mjp_view"](),
                                GameMgr.Inst["load_touming_mjp_view"]();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            //  });
                        },
                        z['on_data_updata'] = function(a) {
                            if (a['character']) {
                                var U = JSON['parse'](JSON['stringify'](a['character']));
                                if (U['characters'])
                                    for (var z = U['characters'], M = 0; M < z['length']; M++) {
                                        for (var g = !1, R = 0; R < this['characters']['length']; R++)
                                            if (this['characters'][R]['charid'] == z[M]['charid']) {
                                                this['characters'][R] = z[M],
                                                    l['UI_Sushe_Visit'].Inst && l['UI_Sushe_Visit'].Inst['chara_info'] && l['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][R]['charid'] && (l['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][R]),
                                                    g = !0;
                                                break;
                                            }
                                        g || this['characters'].push(z[M]);
                                    }
                                if (U['skins']) {
                                    for (var E = U['skins'], M = 0; M < E['length']; M++)
                                        this['skin_map'][E[M]] = 1;
                                    l['UI_Bag'].Inst['on_skin_change']();
                                }
                                if (U['finished_endings']) {
                                    for (var C = U['finished_endings'], M = 0; M < C['length']; M++)
                                        this['finished_endings_map'][C[M]] = 1;
                                    l['UI_Sushe_Visit'].Inst;
                                }
                                if (U['rewarded_endings']) {
                                    for (var C = U['rewarded_endings'], M = 0; M < C['length']; M++)
                                        this['rewarded_endings_map'][C[M]] = 1;
                                    l['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        z['chara_owned'] = function(l) {
                            for (var a = 0; a < this['characters']['length']; a++)
                                if (this['characters'][a]['charid'] == l)
                                    return !0;
                            return !1;
                        },
                        z['skin_owned'] = function(l) {
                            return this['skin_map']['hasOwnProperty'](l['toString']());
                        },
                        z['add_skin'] = function(l) {
                            this['skin_map'][l] = 1;
                        },
                        Object['defineProperty'](z, 'main_chara_info', {
                            get: function() {
                                for (var l = 0; l < this['characters']['length']; l++)
                                    if (this['characters'][l]['charid'] == this['main_character_id'])
                                        return this['characters'][l];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        z['on_view_remove'] = function(l) {
                            for (var a = 0; a < this['commonViewList']['length']; a++)
                                for (var U = this['commonViewList'][a], z = 0; z < U['length']; z++)
                                    if (U[z]['item_id'] == l) {
                                        U[z]['item_id'] = game['GameUtility']['get_view_default_item_id'](U[z].slot);
                                        break;
                                    }
                            var M = cfg['item_definition'].item.get(l);
                            M.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == l && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        z['add_finish_ending'] = function(l) {
                            this['finished_endings_map'][l] = 1;
                        },
                        z['add_reward_ending'] = function(l) {
                            this['rewarded_endings_map'][l] = 1;
                        },
                        z['check_all_char_repoint'] = function() {
                            for (var l = 0; l < z['characters']['length']; l++)
                                if (this['check_char_redpoint'](z['characters'][l]))
                                    return !0;
                            return !1;
                        },
                        z['check_char_redpoint'] = function(l) {
                            // 去除小红点
                            // if (z['hidden_characters_map'][l['charid']])
                            return 0;
                            //END
                            var a = cfg.spot.spot['getGroup'](l['charid']);
                            if (a)
                                for (var U = 0; U < a['length']; U++) {
                                    var M = a[U];
                                    if (!(M['is_married'] && !l['is_upgraded'] || !M['is_married'] && l['level'] < M['level_limit']) && 2 == M.type) {
                                        for (var g = !0, R = 0; R < M['jieju']['length']; R++)
                                            if (M['jieju'][R] && z['finished_endings_map'][M['jieju'][R]]) {
                                                if (!z['rewarded_endings_map'][M['jieju'][R]])
                                                    return !0;
                                                g = !1;
                                            }
                                        if (g)
                                            return !0;
                                    }
                                }
                            return !1;
                        },
                        z['is_char_star'] = function(l) {
                            return -1 != this['star_chars']['indexOf'](l);
                        },
                        z['change_char_star'] = function(l) {
                            var a = this['star_chars']['indexOf'](l); -
                            1 != a ? this['star_chars']['splice'](a, 1) : this['star_chars'].push(l)
                                // 屏蔽网络请求
                                // app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                                //     sort: this['star_chars']
                                // }, function () {});
                                // END
                        },
                        Object['defineProperty'](z['prototype'], 'select_index', {
                            get: function() {
                                return this['_select_index'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        z['prototype']['reset_select_index'] = function() {
                            this['_select_index'] = -1;
                        },
                        z['prototype']['onCreate'] = function() {
                            var U = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new l['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust_rect'] = l['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new l['UI_Character_Chat'](this['container_chat']),
                                this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (!U['page_visit_character'].me['visible'] || !U['page_visit_character']['cannot_click_say'])
                                        if (U['illust']['onClick'](), U['sound_channel'])
                                            U['stopsay']();
                                        else {
                                            if (!U['illust_showing'])
                                                return;
                                            U.say('lobby_normal');
                                        }
                                }, null, !1),
                                this['container_name'] = null,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title')) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                                this['label_name'] = this['container_name']['getChildByName']('label_name'),
                                this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                                this['origin_illust_x'] = this['contianer_illust'].x,
                                this['container_page'] = this.me['getChildByName']('container_page'),
                                this['page_select_character'] = new l['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new l['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new a(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        z['prototype'].show = function(l) {
                            GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var a = 0, U = 0; U < z['characters']['length']; U++)
                                if (z['characters'][U]['charid'] == z['main_character_id']) {
                                    a = U;
                                    break;
                                }
                            0 == l ? (this['change_select'](a), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                        },
                        z['prototype']['starup_back'] = function() {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character']['star_up_back'](z['characters'][this['_select_index']]),
                                this['page_visit_character']['show_levelup']();
                        },
                        z['prototype']['spot_back'] = function() {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character'].show(z['characters'][this['_select_index']], 2);
                        },
                        z['prototype']['go2Lobby'] = function() {
                            this['close'](Laya['Handler']['create'](this, function() {
                                l['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        z['prototype']['close'] = function(a) {
                            var U = this;
                            this['illust_showing'] && l['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                    x: -30
                                }, 150, 0),
                                Laya['timer'].once(150, this, function() {
                                    U['enable'] = !1,
                                        a && a.run();
                                });
                        },
                        z['prototype']['onDisable'] = function() {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        z['prototype']['hide_illust'] = function() {
                            var a = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, l['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function() {
                                a['contianer_illust']['visible'] = !1;
                            })));
                        },
                        z['prototype']['open_illust'] = function() {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, l['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var a = 0, U = 0; U < z['characters']['length']; U++)
                                        if (z['characters'][U]['charid'] == z['main_character_id']) {
                                            a = U;
                                            break;
                                        }
                                    this['change_select'](a);
                                }
                        },
                        z['prototype']['show_page_select'] = function() {
                            this['page_select_character'].show(0);
                        },
                        z['prototype']['show_page_visit'] = function(l) {
                            void 0 === l && (l = 0),
                                this['page_visit_character'].show(z['characters'][this['_select_index']], l);
                        },
                        z['prototype']['change_select'] = function(a) {
                            this['_select_index'] = a,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var U = z['characters'][a];
                            this['label_name'].text = 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? cfg['item_definition']['character'].get(U['charid'])['name_' + GameMgr['client_language']]['replace']('-', '|') : cfg['item_definition']['character'].get(U['charid'])['name_' + GameMgr['client_language']],
                                'chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != z['chs_fengyu_name_lst']['indexOf'](U['charid']) ? 'fengyu' : 'hanyi'),
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['label_cv'].text = cfg['item_definition']['character'].get(U['charid'])['desc_cv_' + GameMgr['client_language']], this['label_cv_title'].text = 'CV') : this['label_cv'].text = 'CV:' + cfg['item_definition']['character'].get(U['charid'])['desc_cv_' + GameMgr['client_language']],
                                'chs' == GameMgr['client_language'] && (this['label_cv'].font = -1 != z['chs_fengyu_cv_lst']['indexOf'](U['charid']) ? 'fengyu' : 'hanyi'),
                                ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && (this['label_cv_title'].y = 355 - this['label_cv']['textField']['textHeight'] / 2 * 0.7);
                            var M = new l['UIRect']();
                            M.x = this['illust_rect'].x,
                                M.y = this['illust_rect'].y,
                                M['width'] = this['illust_rect']['width'],
                                M['height'] = this['illust_rect']['height'],
                                '405503' == U.skin ? M.y -= 70 : '403303' == U.skin && (M.y += 117),
                                this['illust']['setRect'](M),
                                this['illust']['setSkin'](U.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                l['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var g = cfg['item_definition'].skin.get(U.skin);
                            g['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        z['prototype']['onChangeSkin'] = function(l) {
                            z['characters'][this['_select_index']].skin = l,
                                this['change_select'](this['_select_index']),
                                z['characters'][this['_select_index']]['charid'] == z['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = l)
                                // 屏蔽换肤请求
                                // app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                //     character_id: z['characters'][this['_select_index']]['charid'],
                                //     skin: l
                                // }, function () {});
                                // 保存皮肤
                        },
                        z['prototype'].say = function(l) {
                            var a = this,
                                U = z['characters'][this['_select_index']];
                            this['chat_id']++;
                            var M = this['chat_id'],
                                g = view['AudioMgr']['PlayCharactorSound'](U, l, Laya['Handler']['create'](this, function() {
                                    Laya['timer'].once(1000, a, function() {
                                        M == a['chat_id'] && a['stopsay']();
                                    });
                                }));
                            g && (this['chat_block'].show(g['words']), this['sound_channel'] = g['sound']);
                        },
                        z['prototype']['stopsay'] = function() {
                            this['chat_block']['close'](!1),
                                this['sound_channel'] && (this['sound_channel'].stop(), Laya['SoundManager']['removeChannel'](this['sound_channel']), this['sound_channel'] = null);
                        },
                        z['prototype']['to_look_illust'] = function() {
                            var l = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function() {
                                l['illust']['playAnim']('idle'),
                                    l['page_select_character'].show(0);
                            }));
                        },
                        z['prototype']['jump_to_char_skin'] = function(a, U) {
                            var M = this;
                            if (void 0 === a && (a = -1), void 0 === U && (U = null), a >= 0)
                                for (var g = 0; g < z['characters']['length']; g++)
                                    if (z['characters'][g]['charid'] == a) {
                                        this['change_select'](g);
                                        break;
                                    }
                            l['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function() {
                                z.Inst['show_page_visit'](),
                                    M['page_visit_character']['show_pop_skin'](),
                                    M['page_visit_character']['set_jump_callback'](U);
                            }));
                        },
                        z['prototype']['jump_to_char_qiyue'] = function(a) {
                            var U = this;
                            if (void 0 === a && (a = -1), a >= 0)
                                for (var M = 0; M < z['characters']['length']; M++)
                                    if (z['characters'][M]['charid'] == a) {
                                        this['change_select'](M);
                                        break;
                                    }
                            l['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function() {
                                z.Inst['show_page_visit'](),
                                    U['page_visit_character']['show_qiyue']();
                            }));
                        },
                        z['prototype']['jump_to_char_gift'] = function(a) {
                            var U = this;
                            if (void 0 === a && (a = -1), a >= 0)
                                for (var M = 0; M < z['characters']['length']; M++)
                                    if (z['characters'][M]['charid'] == a) {
                                        this['change_select'](M);
                                        break;
                                    }
                            l['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function() {
                                z.Inst['show_page_visit'](),
                                    U['page_visit_character']['show_gift']();
                            }));
                        },
                        z['characters'] = [],
                        z['chs_fengyu_name_lst'] = ['200040', '200043'],
                        z['chs_fengyu_cv_lst'] = ['200047', '200050', '200054'],
                        z['skin_map'] = {},
                        z['main_character_id'] = 0,
                        z['send_gift_count'] = 0,
                        z['send_gift_limit'] = 0,
                        z['commonViewList'] = [],
                        z['using_commonview_index'] = 0,
                        z['finished_endings_map'] = {},
                        z['rewarded_endings_map'] = {},
                        z['star_chars'] = [],
                        z['hidden_characters_map'] = {},
                        z.Inst = null,
                        z;
                }
                (l['UIBase']);
            l['UI_Sushe'] = U;
        }
        (uiscript || (uiscript = {}));





        // 屏蔽改变宿舍角色的网络请求
        ! function(l) {
            var a = function() {
                    function a(a) {
                        var z = this;
                        this['scrollview'] = null,
                            this['select_index'] = 0,
                            this['show_index_list'] = [],
                            this['only_show_star_char'] = !1,
                            this.me = a,
                            this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                U.Inst['locking'] || U.Inst['close'](Laya['Handler']['create'](z, function() {
                                    l['UI_Sushe'].Inst['show_page_visit']();
                                }));
                            }, null, !1),
                            this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                U.Inst['locking'] || U.Inst['close'](Laya['Handler']['create'](z, function() {
                                    l['UI_Sushe'].Inst['to_look_illust']();
                                }));
                            }, null, !1),
                            this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                U.Inst['locking'] || l['UI_Sushe'].Inst['jump_to_char_skin']();
                            }, null, !1),
                            this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                U.Inst['locking'] || z['onChangeStarShowBtnClick']();
                            }, null, !1),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['dongtai_kaiguan'] = new l['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function() {
                                l['UI_Sushe'].Inst['illust']['resetSkin']();
                            }));
                    }
                    return a['prototype'].show = function(a, U) {
                            void 0 === U && (U = !1),
                                this.me['visible'] = !0,
                                a ? this.me['alpha'] = 1 : l['UIBase']['anim_alpha_in'](this.me, {
                                    x: 0
                                }, 200, 0),
                                this['getShowStarState'](),
                                this['sortShowCharsList'](),
                                U || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47),
                                this['scrollview']['reset'](),
                                this['scrollview']['addItem'](this['show_index_list']['length']);
                        },
                        a['prototype']['render_character_cell'] = function(a) {
                            var U = this,
                                z = a['index'],
                                M = a['container'],
                                g = a['cache_data'];
                            M['visible'] = !0,
                                g['index'] = z,
                                g['inited'] || (g['inited'] = !0, M['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                    U['onClickAtHead'](g['index']);
                                }), g.skin = new l['UI_Character_Skin'](M['getChildByName']('btn')['getChildByName']('head')), g.bg = M['getChildByName']('btn')['getChildByName']('bg'), g['bound'] = M['getChildByName']('btn')['getChildByName']('bound'), g['btn_star'] = M['getChildByName']('btn_star'), g.star = M['getChildByName']('btn')['getChildByName']('star'), g['btn_star']['clickHandler'] = new Laya['Handler'](this, function() {
                                    U['onClickAtStar'](g['index']);
                                }));
                            var R = M['getChildByName']('btn');
                            R['getChildByName']('choose')['visible'] = z == this['select_index'];
                            var E = this['getCharInfoByIndex'](z);
                            R['getChildByName']('redpoint')['visible'] = l['UI_Sushe']['check_char_redpoint'](E),
                                g.skin['setSkin'](E.skin, 'bighead'),
                                R['getChildByName']('using')['visible'] = E['charid'] == l['UI_Sushe']['main_character_id'],
                                M['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (E['is_upgraded'] ? '2.png' : '.png'));
                            var C = cfg['item_definition']['character'].get(E['charid']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? g['bound'].skin = C.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (E['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (E['is_upgraded'] ? '2.png' : '.png')) : C.ur ? (g['bound'].pos(-10, -2), g['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (E['is_upgraded'] ? '6.png' : '5.png'))) : (g['bound'].pos(4, 20), g['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (E['is_upgraded'] ? '4.png' : '3.png'))),
                                g['btn_star']['visible'] = this['select_index'] == z,
                                g.star['visible'] = l['UI_Sushe']['is_char_star'](E['charid']) || this['select_index'] == z,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (g.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (l['UI_Sushe']['is_char_star'](E['charid']) ? 'l' : 'd') + (E['is_upgraded'] ? '1.png' : '.png')), R['getChildByName']('label_name').text = cfg['item_definition']['character'].find(E['charid'])['name_' + GameMgr['client_language']]['replace']('-', '|')) : (g.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (l['UI_Sushe']['is_char_star'](E['charid']) ? 'l.png' : 'd.png')), R['getChildByName']('label_name').text = cfg['item_definition']['character'].find(E['charid'])['name_' + GameMgr['client_language']]),
                                ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == E['charid'] ? (R['getChildByName']('label_name')['scaleX'] = 0.67, R['getChildByName']('label_name')['scaleY'] = 0.57) : (R['getChildByName']('label_name')['scaleX'] = 0.7, R['getChildByName']('label_name')['scaleY'] = 0.6));
                        },
                        a['prototype']['onClickAtHead'] = function(a) {
                            if (this['select_index'] == a) {
                                var U = this['getCharInfoByIndex'](a);
                                if (U['charid'] != l['UI_Sushe']['main_character_id'])
                                    if (l['UI_PiPeiYuYue'].Inst['enable'])
                                        l['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                    else {
                                        var z = l['UI_Sushe']['main_character_id'];
                                        l['UI_Sushe']['main_character_id'] = U['charid'],
                                            // app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                            //     character_id: l['UI_Sushe']['main_character_id']
                                            // }, function () {}),
                                            GameMgr.Inst['account_data']['avatar_id'] = U.skin;
                                        // 保存人物和皮肤
                                        MMP.settings.character = U.charid;
                                        MMP.settings.characters[MMP.settings.character - 200001] = U.skin;
                                        MMP.saveSettings();
                                        // END
                                        for (var M = 0; M < this['show_index_list']['length']; M++)
                                            this['getCharInfoByIndex'](M)['charid'] == z && this['scrollview']['wantToRefreshItem'](M);
                                        this['scrollview']['wantToRefreshItem'](a);
                                    }
                            } else {
                                var g = this['select_index'];
                                this['select_index'] = a,
                                    g >= 0 && this['scrollview']['wantToRefreshItem'](g),
                                    this['scrollview']['wantToRefreshItem'](a),
                                    l['UI_Sushe'].Inst['change_select'](this['show_index_list'][a]);
                            }
                        },
                        a['prototype']['onClickAtStar'] = function(a) {
                            if (l['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](a)['charid']), this['only_show_star_char'])
                                this['scrollview']['wantToRefreshItem'](a);
                            else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                                var U = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                                this['scrollview'].rate = Math.min(1, Math.max(0, U));
                            }
                            // 保存人物和皮肤
                            MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                            MMP.saveSettings();
                            // END
                        },
                        a['prototype']['close'] = function(a) {
                            var U = this;
                            this.me['visible'] && (a ? this.me['visible'] = !1 : l['UIBase']['anim_alpha_out'](this.me, {
                                x: 0
                            }, 200, 0, Laya['Handler']['create'](this, function() {
                                U.me['visible'] = !1;
                            })));
                        },
                        a['prototype']['onChangeStarShowBtnClick'] = function() {
                            if (!this['only_show_star_char']) {
                                for (var a = !1, U = 0, z = l['UI_Sushe']['star_chars']; U < z['length']; U++) {
                                    var M = z[U];
                                    if (!l['UI_Sushe']['hidden_characters_map'][M]) {
                                        a = !0;
                                        break;
                                    }
                                }
                                if (!a)
                                    return l['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                            }
                            l['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                                this['only_show_star_char'] = !this['only_show_star_char'],
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                            var g = this.me['getChildByName']('btn_star')['getChildAt'](1);
                            Laya['Tween']['clearAll'](g),
                                Laya['Tween'].to(g, {
                                    x: this['only_show_star_char'] ? 107 : 47
                                }, 150),
                                this.show(!0, !0);
                        },
                        a['prototype']['getShowStarState'] = function() {
                            if (0 == l['UI_Sushe']['star_chars']['length'])
                                return this['only_show_star_char'] = !1, void 0;
                            if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                                for (var a = 0, U = l['UI_Sushe']['star_chars']; a < U['length']; a++) {
                                    var z = U[a];
                                    if (!l['UI_Sushe']['hidden_characters_map'][z])
                                        return;
                                }
                                this['only_show_star_char'] = !1,
                                    app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                            }
                        },
                        a['prototype']['sortShowCharsList'] = function() {
                            this['show_index_list'] = [],
                                this['select_index'] = -1;
                            for (var a = 0, U = l['UI_Sushe']['star_chars']; a < U['length']; a++) {
                                var z = U[a];
                                if (!l['UI_Sushe']['hidden_characters_map'][z])
                                    for (var M = 0; M < l['UI_Sushe']['characters']['length']; M++)
                                        if (l['UI_Sushe']['characters'][M]['charid'] == z) {
                                            M == l['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                                this['show_index_list'].push(M);
                                            break;
                                        }
                            }
                            if (!this['only_show_star_char'])
                                for (var M = 0; M < l['UI_Sushe']['characters']['length']; M++)
                                    l['UI_Sushe']['hidden_characters_map'][l['UI_Sushe']['characters'][M]['charid']] || -1 == this['show_index_list']['indexOf'](M) && (M == l['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(M));
                        },
                        a['prototype']['getCharInfoByIndex'] = function(a) {
                            return l['UI_Sushe']['characters'][this['show_index_list'][a]];
                        },
                        a;
                }
                (),
                U = function(U) {
                    function z() {
                        var l = U.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return l['bg_width_head'] = 962,
                            l['bg_width_zhuangban'] = 1819,
                            l['bg2_delta'] = -29,
                            l['container_top'] = null,
                            l['locking'] = !1,
                            l.tabs = [],
                            l['tab_index'] = 0,
                            z.Inst = l,
                            l;
                    }
                    return __extends(z, U),
                        z['prototype']['onCreate'] = function() {
                            var U = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    U['locking'] || (1 == U['tab_index'] && U['container_zhuangban']['changed'] ? l['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function() {
                                        U['close'](),
                                            l['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (U['close'](), l['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var z = this.root['getChildByName']('container_tabs'), M = function(a) {
                                    g.tabs.push(z['getChildAt'](a)),
                                        g.tabs[a]['clickHandler'] = new Laya['Handler'](g, function() {
                                            U['locking'] || U['tab_index'] != a && (1 == U['tab_index'] && U['container_zhuangban']['changed'] ? l['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function() {
                                                U['change_tab'](a);
                                            }), null) : U['change_tab'](a));
                                        });
                                }, g = this, R = 0; R < z['numChildren']; R++)
                                M(R);
                            this['container_head'] = new a(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new l['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function() {
                                    return U['locking'];
                                }));
                        },
                        z['prototype'].show = function(a) {
                            var U = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = a,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), l['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), l['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), l['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), l['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function() {
                                    U['locking'] = !1;
                                });
                            for (var z = 0; z < this.tabs['length']; z++) {
                                var M = this.tabs[z];
                                M.skin = game['Tools']['localUISrc'](z == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var g = M['getChildByName']('word');
                                g['color'] = z == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    g['scaleX'] = g['scaleY'] = z == this['tab_index'] ? 1.1 : 1,
                                    z == this['tab_index'] && M['parent']['setChildIndex'](M, this.tabs['length'] - 1);
                            }
                        },
                        z['prototype']['change_tab'] = function(a) {
                            var U = this;
                            this['tab_index'] = a;
                            for (var z = 0; z < this.tabs['length']; z++) {
                                var M = this.tabs[z];
                                M.skin = game['Tools']['localUISrc'](z == a ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var g = M['getChildByName']('word');
                                g['color'] = z == a ? '#552c1c' : '#d3a86c',
                                    g['scaleX'] = g['scaleY'] = z == a ? 1.1 : 1,
                                    z == a && M['parent']['setChildIndex'](M, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function() {
                                    l['UI_Sushe'].Inst['open_illust'](),
                                        U['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), l['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_zhuangban']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function() {
                                    U['container_zhuangban'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_zhuangban'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])),
                                Laya['timer'].once(400, this, function() {
                                    U['locking'] = !1;
                                });
                        },
                        z['prototype']['close'] = function(a) {
                            var U = this;
                            this['locking'] = !0,
                                l['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? l['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function() {
                                    U['container_head']['close'](!0);
                                })) : l['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function() {
                                    U['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function() {
                                    U['locking'] = !1,
                                        U['enable'] = !1,
                                        a && a.run();
                                });
                        },
                        z['prototype']['onDisable'] = function() {
                            for (var a = 0; a < l['UI_Sushe']['characters']['length']; a++) {
                                var U = l['UI_Sushe']['characters'][a].skin,
                                    z = cfg['item_definition'].skin.get(U);
                                z && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](z.path + '/bighead.png'));
                            }
                        },
                        z['prototype']['changeKaiguanShow'] = function(l) {
                            l ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        z;
                }
                (l['UIBase']);
            l['UI_Sushe_Select'] = U;
        }
        (uiscript || (uiscript = {}));




        // 友人房
        ! function(l) {
            var a = function() {
                    function a(l) {
                        var a = this;
                        this['friends'] = [],
                            this['sortlist'] = [],
                            this.me = l,
                            this.me['visible'] = !1,
                            this['blackbg'] = l['getChildByName']('blackbg'),
                            this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                a['locking'] || a['close']();
                            }, null, !1),
                            this.root = l['getChildByName']('root'),
                            this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                            this['noinfo'] = this.root['getChildByName']('noinfo');
                    }
                    return a['prototype'].show = function() {
                            var a = this;
                            this['locking'] = !0,
                                this.me['visible'] = !0,
                                this['scrollview']['reset'](),
                                this['friends'] = [],
                                this['sortlist'] = [];
                            for (var U = game['FriendMgr']['friend_list'], z = 0; z < U['length']; z++)
                                this['sortlist'].push(z);
                            this['sortlist'] = this['sortlist'].sort(function(l, a) {
                                var z = U[l],
                                    M = 0;
                                if (z['state']['is_online']) {
                                    var g = game['Tools']['playState2Desc'](z['state']['playing']);
                                    M += '' != g ? 30000000000 : 60000000000,
                                        z.base['level'] && (M += z.base['level'].id % 1000 * 10000000),
                                        z.base['level3'] && (M += z.base['level3'].id % 1000 * 10000),
                                        M += -Math['floor'](z['state']['login_time'] / 10000000);
                                } else
                                    M += z['state']['logout_time'];
                                var R = U[a],
                                    E = 0;
                                if (R['state']['is_online']) {
                                    var g = game['Tools']['playState2Desc'](R['state']['playing']);
                                    E += '' != g ? 30000000000 : 60000000000,
                                        R.base['level'] && (E += R.base['level'].id % 1000 * 10000000),
                                        R.base['level3'] && (E += R.base['level3'].id % 1000 * 10000),
                                        E += -Math['floor'](R['state']['login_time'] / 10000000);
                                } else
                                    E += R['state']['logout_time'];
                                return E - M;
                            });
                            for (var z = 0; z < U['length']; z++)
                                this['friends'].push({
                                    f: U[z],
                                    invited: !1
                                });
                            this['noinfo']['visible'] = 0 == this['friends']['length'],
                                this['scrollview']['addItem'](this['friends']['length']),
                                l['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    a['locking'] = !1;
                                }));
                        },
                        a['prototype']['close'] = function() {
                            var a = this;
                            this['locking'] = !0,
                                l['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                    a['locking'] = !1,
                                        a.me['visible'] = !1;
                                }));
                        },
                        a['prototype']['render_item'] = function(a) {
                            var U = a['index'],
                                z = a['container'],
                                g = a['cache_data'];
                            g.head || (g.head = new l['UI_Head'](z['getChildByName']('head'), 'UI_WaitingRoom'), g.name = z['getChildByName']('name'), g['state'] = z['getChildByName']('label_state'), g.btn = z['getChildByName']('btn_invite'), g['invited'] = z['getChildByName']('invited'));
                            var R = this['friends'][this['sortlist'][U]];
                            g.head.id = game['GameUtility']['get_limited_skin_id'](R.f.base['avatar_id']),
                                g.head['set_head_frame'](R.f.base['account_id'], R.f.base['avatar_frame']),
                                game['Tools']['SetNickname'](g.name, R.f.base);
                            var E = !1;
                            if (R.f['state']['is_online']) {
                                var C = game['Tools']['playState2Desc'](R.f['state']['playing']);
                                '' != C ? (g['state'].text = game['Tools']['strOfLocalization'](2069, [C]), g['state']['color'] = '#a9d94d', g.name['color'] = '#a9d94d') : (g['state'].text = game['Tools']['strOfLocalization'](2071), g['state']['color'] = '#58c4db', g.name['color'] = '#58c4db', E = !0);
                            } else
                                g['state'].text = game['Tools']['strOfLocalization'](2072), g['state']['color'] = '#8c8c8c', g.name['color'] = '#8c8c8c';
                            R['invited'] ? (g.btn['visible'] = !1, g['invited']['visible'] = !0) : (g.btn['visible'] = !0, g['invited']['visible'] = !1, game['Tools']['setGrayDisable'](g.btn, !E), E && (g.btn['clickHandler'] = Laya['Handler']['create'](this, function() {
                                game['Tools']['setGrayDisable'](g.btn, !0);
                                var a = {
                                    room_id: M.Inst['room_id'],
                                    mode: M.Inst['room_mode'],
                                    nickname: GameMgr.Inst['account_data']['nickname'],
                                    verified: GameMgr.Inst['account_data']['verified'],
                                    account_id: GameMgr.Inst['account_id']
                                };
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                    target_id: R.f.base['account_id'],
                                    type: game['EFriendMsgType']['room_invite'],
                                    content: JSON['stringify'](a)
                                }, function(a, U) {
                                    a || U['error'] ? (game['Tools']['setGrayDisable'](g.btn, !1), l['UIMgr'].Inst['showNetReqError']('sendClientMessage', a, U)) : (g.btn['visible'] = !1, g['invited']['visible'] = !0, R['invited'] = !0);
                                });
                            }, null, !1)));
                        },
                        a;
                }
                (),
                U = function() {
                    function a(a) {
                        var U = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = a,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new l['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new l['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function() {
                                return U['locking'];
                            }));
                        for (var z = this.root['getChildByName']('container_tabs'), M = function(a) {
                                g.tabs.push(z['getChildAt'](a)),
                                    g.tabs[a]['clickHandler'] = new Laya['Handler'](g, function() {
                                        U['locking'] || U['tab_index'] != a && (1 == U['tab_index'] && U['page_zhangban']['changed'] ? l['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function() {
                                            U['change_tab'](a);
                                        }), null) : U['change_tab'](a));
                                    });
                            }, g = this, R = 0; R < z['numChildren']; R++)
                            M(R);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function() {
                                U['locking'] || (1 == U['tab_index'] && U['page_zhangban']['changed'] ? l['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function() {
                                    U['close'](!1);
                                }), null) : U['close'](!1));
                            }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function() {
                                U['locking'] || (1 == U['tab_index'] && U['page_zhangban']['changed'] ? l['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](U, function() {
                                    U['close'](!1);
                                }), null) : U['close'](!1));
                            });
                    }
                    return a['prototype'].show = function() {
                            var a = this;
                            this.me['visible'] = !0,
                                this['blackmask']['alpha'] = 0,
                                this['locking'] = !0,
                                Laya['Tween'].to(this['blackmask'], {
                                    alpha: 0.3
                                }, 150),
                                l['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    a['locking'] = !1;
                                })),
                                this['tab_index'] = 0,
                                this['page_zhangban']['close'](!0),
                                this['page_head'].show(!0);
                            for (var U = 0; U < this.tabs['length']; U++) {
                                var z = this.tabs[U];
                                z.skin = game['Tools']['localUISrc'](U == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var M = z['getChildByName']('word');
                                M['color'] = U == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    M['scaleX'] = M['scaleY'] = U == this['tab_index'] ? 1.1 : 1,
                                    U == this['tab_index'] && z['parent']['setChildIndex'](z, this.tabs['length'] - 1);
                            }
                        },
                        a['prototype']['change_tab'] = function(l) {
                            var a = this;
                            this['tab_index'] = l;
                            for (var U = 0; U < this.tabs['length']; U++) {
                                var z = this.tabs[U];
                                z.skin = game['Tools']['localUISrc'](U == l ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var M = z['getChildByName']('word');
                                M['color'] = U == l ? '#552c1c' : '#d3a86c',
                                    M['scaleX'] = M['scaleY'] = U == l ? 1.1 : 1,
                                    U == l && z['parent']['setChildIndex'](z, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(200, this, function() {
                                    a['page_head'].show(!1);
                                })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(200, this, function() {
                                    a['page_zhangban'].show(!1);
                                })),
                                Laya['timer'].once(400, this, function() {
                                    a['locking'] = !1;
                                });
                        },
                        a['prototype']['close'] = function(a) {
                            var U = this;
                            //修改友人房间立绘
                            if (!(U.page_head.choosed_chara_index == 0 && U.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = U.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = U.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = U.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[U.page_head.choosed_chara_index] = U.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me['visible'] && (a ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: M.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function() {}), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), l['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                U['locking'] = !1,
                                    U.me['visible'] = !1;
                            }))));
                        },
                        a;
                }
                (),
                z = function() {
                    function l(l) {
                        this['modes'] = [],
                            this.me = l,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return l['prototype'].show = function(l) {
                            this.me['visible'] = !0,
                                this['scrollview']['reset'](),
                                this['modes'] = l,
                                this['scrollview']['addItem'](l['length']);
                            var a = this['scrollview']['total_height'];
                            a > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - a, this.bg['height'] = a + 20),
                                this.bg['visible'] = !0;
                        },
                        l['prototype']['render_item'] = function(l) {
                            var a = l['index'],
                                U = l['container'],
                                z = U['getChildByName']('info');
                            z['fontSize'] = 40,
                                z['fontSize'] = this['modes'][a]['length'] <= 5 ? 40 : this['modes'][a]['length'] <= 9 ? 55 - 3 * this['modes'][a]['length'] : 28,
                                z.text = this['modes'][a];
                        },
                        l;
                }
                (),
                M = function(M) {
                    function g() {
                        var a = M.call(this, new ui['lobby']['waitingroomUI']()) || this;
                        return a['skin_ready'] = 'myres/room/btn_ready.png',
                            a['skin_cancel'] = 'myres/room/btn_cancel.png',
                            a['skin_start'] = 'myres/room/btn_start.png',
                            a['skin_start_no'] = 'myres/room/btn_start_no.png',
                            a['update_seq'] = 0,
                            a['pre_msgs'] = [],
                            a['msg_tail'] = -1,
                            a['posted'] = !1,
                            a['label_rommid'] = null,
                            a['player_cells'] = [],
                            a['btn_ok'] = null,
                            a['btn_invite_friend'] = null,
                            a['btn_add_robot'] = null,
                            a['btn_dress'] = null,
                            a['beReady'] = !1,
                            a['room_id'] = -1,
                            a['owner_id'] = -1,
                            a['tournament_id'] = 0,
                            a['max_player_count'] = 0,
                            a['players'] = [],
                            a['container_rules'] = null,
                            a['container_top'] = null,
                            a['container_right'] = null,
                            a['locking'] = !1,
                            a['mousein_copy'] = !1,
                            a['popout'] = null,
                            a['room_link'] = null,
                            a['btn_copy_link'] = null,
                            a['last_start_room'] = 0,
                            a['invitefriend'] = null,
                            a['pre_choose'] = null,
                            a['ai_name'] = game['Tools']['strOfLocalization'](2003),
                            g.Inst = a,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](a, function(l) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](l)),
                                    a['onReadyChange'](l['account_id'], l['ready'], l['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](a, function(l) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](l)),
                                    a['onPlayerChange'](l);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](a, function(l) {
                                a['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](l)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), a['onGameStart'](l));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](a, function(l) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](l)),
                                    a['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](a, function() {
                                a['enable'] && a.hide(Laya['Handler']['create'](a, function() {
                                    l['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            a;
                    }
                    return __extends(g, M),
                        g['prototype']['push_msg'] = function(l) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](l)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](l));
                        },
                        Object['defineProperty'](g['prototype'], 'inRoom', {
                            get: function() {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](g['prototype'], 'robot_count', {
                            get: function() {
                                for (var l = 0, a = 0; a < this['players']['length']; a++)
                                    2 == this['players'][a]['category'] && l++;
                                return l;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        g['prototype']['resetData'] = function() {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        g['prototype']['updateData'] = function(l) {
                            if (!l)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < l.persons.length; i++) {

                                if (l.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    l.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    l.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    l.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    l.persons[i].title = GameMgr.Inst.account_data.title;
                                    l.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        l.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = l['room_id'],
                                this['owner_id'] = l['owner_id'],
                                this['room_mode'] = l.mode,
                                this['public_live'] = l['public_live'],
                                this['tournament_id'] = 0,
                                l['tournament_id'] && (this['tournament_id'] = l['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = l['max_player_count'],
                                this['players'] = [];
                            for (var a = 0; a < l['persons']['length']; a++) {
                                var U = l['persons'][a];
                                U['ready'] = !1,
                                    U['cell_index'] = -1,
                                    U['category'] = 1,
                                    this['players'].push(U);
                            }
                            for (var a = 0; a < l['robot_count']; a++)
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
                            for (var a = 0; a < l['ready_list']['length']; a++)
                                for (var z = 0; z < this['players']['length']; z++)
                                    if (this['players'][z]['account_id'] == l['ready_list'][a]) {
                                        this['players'][z]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                l.seq && (this['update_seq'] = l.seq);
                        },
                        g['prototype']['onReadyChange'] = function(l, a, U) {
                            for (var z = 0; z < this['players']['length']; z++)
                                if (this['players'][z]['account_id'] == l) {
                                    this['players'][z]['ready'] = a,
                                        this['players'][z]['dressing'] = U,
                                        this['_onPlayerReadyChange'](this['players'][z]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        g['prototype']['onPlayerChange'] = function(l) {
                            if (app.Log.log(l), l = l['toJSON'](), !(l.seq && l.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < l.player_list.length; i++) {

                                    if (l.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        l.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        l.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        l.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            l.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (l.update_list != undefined) {
                                    for (var i = 0; i < l.update_list.length; i++) {

                                        if (l.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            l.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            l.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            l.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                l.update_list[i].nickname = MMP.settings.nickname;
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
                                this['update_seq'] = l.seq;
                                var a = {};
                                a.type = 'onPlayerChange0',
                                    a['players'] = this['players'],
                                    a.msg = l,
                                    this['push_msg'](JSON['stringify'](a));
                                var U = this['robot_count'],
                                    z = l['robot_count'];
                                if (z < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, U--);
                                    for (var M = 0; M < this['players']['length']; M++)
                                        2 == this['players'][M]['category'] && U > z && (this['players'][M]['category'] = 0, U--);
                                }
                                for (var g = [], R = l['player_list'], M = 0; M < this['players']['length']; M++)
                                    if (1 == this['players'][M]['category']) {
                                        for (var E = -1, C = 0; C < R['length']; C++)
                                            if (R[C]['account_id'] == this['players'][M]['account_id']) {
                                                E = C;
                                                break;
                                            }
                                        if (-1 != E) {
                                            var B = R[E];
                                            g.push(this['players'][M]),
                                                this['players'][M]['avatar_id'] = B['avatar_id'],
                                                this['players'][M]['title'] = B['title'],
                                                this['players'][M]['verified'] = B['verified'];
                                        }
                                    } else
                                        2 == this['players'][M]['category'] && g.push(this['players'][M]);
                                this['players'] = g;
                                for (var M = 0; M < R['length']; M++) {
                                    for (var w = !1, B = R[M], C = 0; C < this['players']['length']; C++)
                                        if (1 == this['players'][C]['category'] && this['players'][C]['account_id'] == B['account_id']) {
                                            w = !0;
                                            break;
                                        }
                                    w || this['players'].push({
                                        account_id: B['account_id'],
                                        avatar_id: B['avatar_id'],
                                        nickname: B['nickname'],
                                        verified: B['verified'],
                                        title: B['title'],
                                        level: B['level'],
                                        level3: B['level3'],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var L = [!1, !1, !1, !1], M = 0; M < this['players']['length']; M++)
                                    -
                                    1 != this['players'][M]['cell_index'] && (L[this['players'][M]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][M]));
                                for (var M = 0; M < this['players']['length']; M++)
                                    if (1 == this['players'][M]['category'] && -1 == this['players'][M]['cell_index'])
                                        for (var C = 0; C < this['max_player_count']; C++)
                                            if (!L[C]) {
                                                this['players'][M]['cell_index'] = C,
                                                    L[C] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][M]);
                                                break;
                                            }
                                for (var U = this['robot_count'], z = l['robot_count']; z > U;) {
                                    for (var c = -1, C = 0; C < this['max_player_count']; C++)
                                        if (!L[C]) {
                                            c = C;
                                            break;
                                        }
                                    if (-1 == c)
                                        break;
                                    L[c] = !0,
                                        this['players'].push({
                                            category: 2,
                                            cell_index: c,
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
                                        U++;
                                }
                                for (var M = 0; M < this['max_player_count']; M++)
                                    L[M] || this['_clearCell'](M);
                                var a = {};
                                if (a.type = 'onPlayerChange1', a['players'] = this['players'], this['push_msg'](JSON['stringify'](a)), l['owner_id']) {
                                    if (this['owner_id'] = l['owner_id'], this['enable'])
                                        if (this['owner_id'] == GameMgr.Inst['account_id'])
                                            this['refreshAsOwner']();
                                        else
                                            for (var C = 0; C < this['players']['length']; C++)
                                                if (this['players'][C] && this['players'][C]['account_id'] == this['owner_id']) {
                                                    this['_refreshPlayerInfo'](this['players'][C]);
                                                    break;
                                                }
                                } else if (this['enable'])
                                    if (this['owner_id'] == GameMgr.Inst['account_id'])
                                        this['refreshAsOwner']();
                                    else
                                        for (var C = 0; C < this['players']['length']; C++)
                                            if (this['players'][C] && this['players'][C]['account_id'] == this['owner_id']) {
                                                this['_refreshPlayerInfo'](this['players'][C]);
                                                break;
                                            }
                            }
                        },
                        g['prototype']['onBeKictOut'] = function() {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), l['UI_Lobby'].Inst['enable'] = !0, l['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        g['prototype']['onCreate'] = function() {
                            var M = this;
                            this['last_start_room'] = 0;
                            var g = this.me['getChildByName']('root');
                            this['container_top'] = g['getChildByName']('top'),
                                this['container_right'] = g['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var R = function(a) {
                                    var U = g['getChildByName']('player_' + a['toString']()),
                                        z = {};
                                    z['index'] = a,
                                        z['container'] = U,
                                        z['container_flag'] = U['getChildByName']('flag'),
                                        z['container_flag']['visible'] = !1,
                                        z['container_name'] = U['getChildByName']('container_name'),
                                        z.name = U['getChildByName']('container_name')['getChildByName']('name'),
                                        z['btn_t'] = U['getChildByName']('btn_t'),
                                        z['container_illust'] = U['getChildByName']('container_illust'),
                                        z['illust'] = new l['UI_Character_Skin'](U['getChildByName']('container_illust')['getChildByName']('illust')),
                                        z.host = U['getChildByName']('host'),
                                        z['title'] = new l['UI_PlayerTitle'](U['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                        z.rank = new l['UI_Level'](U['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                        z['is_robot'] = !1;
                                    var R = 0;
                                    z['btn_t']['clickHandler'] = Laya['Handler']['create'](E, function() {
                                            if (!(M['locking'] || Laya['timer']['currTimer'] < R)) {
                                                R = Laya['timer']['currTimer'] + 500;
                                                for (var l = 0; l < M['players']['length']; l++)
                                                    if (M['players'][l]['cell_index'] == a) {
                                                        M['kickPlayer'](l);
                                                        break;
                                                    }
                                            }
                                        }, null, !1),
                                        z['btn_info'] = U['getChildByName']('btn_info'),
                                        z['btn_info']['clickHandler'] = Laya['Handler']['create'](E, function() {
                                            if (!M['locking'])
                                                for (var U = 0; U < M['players']['length']; U++)
                                                    if (M['players'][U]['cell_index'] == a) {
                                                        M['players'][U]['account_id'] && M['players'][U]['account_id'] > 0 && l['UI_OtherPlayerInfo'].Inst.show(M['players'][U]['account_id'], M['room_mode'].mode < 10 ? 1 : 2);
                                                        break;
                                                    }
                                        }, null, !1),
                                        E['player_cells'].push(z);
                                }, E = this, C = 0; 4 > C; C++)
                                R(C);
                            this['btn_ok'] = g['getChildByName']('btn_ok');
                            var B = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                Laya['timer']['currTimer'] < B + 500 || (B = Laya['timer']['currTimer'], M['owner_id'] == GameMgr.Inst['account_id'] ? M['getStart']() : M['switchReady']());
                            }, null, !1);
                            var w = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Laya['timer']['currTimer'] < w + 500 || (w = Laya['timer']['currTimer'], M['leaveRoom']());
                                }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    M['locking'] || M['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var L = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    M['locking'] || Laya['timer']['currTimer'] < L || (L = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                        robot_count: M['robot_count'] + 1
                                    }, function(a, U) {
                                        (a || U['error'] && 1111 != U['error'].code) && l['UIMgr'].Inst['showNetReqError']('modifyRoom_add', a, U),
                                            L = 0;
                                    }));
                                }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (!M['locking']) {
                                        var a = 0;
                                        M['room_mode']['detail_rule'] && M['room_mode']['detail_rule']['chuanma'] && (a = 1),
                                            l['UI_Rules'].Inst.show(0, null, a);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function() {
                                    M['locking'] || M['beReady'] && M['owner_id'] != GameMgr.Inst['account_id'] || (M['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: M['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function() {}));
                                });
                            var c = this['container_right']['getChildByName']('btn_copy');
                            c.on('mouseover', this, function() {
                                    M['mousein_copy'] = !0;
                                }),
                                c.on('mouseout', this, function() {
                                    M['mousein_copy'] = !1;
                                }),
                                c['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    M['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), M['popout']['visible'] = !0, l['UIBase']['anim_pop_out'](M['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new z(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    var a = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    a.call('setSysClipboardText', M['room_link'].text),
                                        l['UIBase']['anim_pop_hide'](M['popout'], Laya['Handler']['create'](M, function() {
                                            M['popout']['visible'] = !1;
                                        })),
                                        l['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', M['room_link'].text, function() {}),
                                        l['UIBase']['anim_pop_hide'](M['popout'], Laya['Handler']['create'](M, function() {
                                            M['popout']['visible'] = !1;
                                        })),
                                        l['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    l['UIBase']['anim_pop_hide'](M['popout'], Laya['Handler']['create'](M, function() {
                                        M['popout']['visible'] = !1;
                                    }));
                                }, null, !1),
                                this['invitefriend'] = new a(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new U(this.me['getChildByName']('pop_view'));
                        },
                        g['prototype'].show = function() {
                            var a = this;
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['mousein_copy'] = !1,
                                this['beReady'] = !1,
                                this['invitefriend'].me['visible'] = !1,
                                this['btn_add_robot']['visible'] = !1,
                                this['btn_invite_friend']['visible'] = !1,
                                game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                                this['pre_choose'] = null,
                                this['pop_change_view']['close'](!0);
                            for (var U = 0; 4 > U; U++)
                                this['player_cells'][U]['container']['visible'] = U < this['max_player_count'];
                            for (var U = 0; U < this['max_player_count']; U++)
                                this['_clearCell'](U);
                            for (var U = 0; U < this['players']['length']; U++)
                                this['players'][U]['cell_index'] = U, this['_refreshPlayerInfo'](this['players'][U]);
                            this['msg_tail'] = -1,
                                this['pre_msgs'] = [],
                                this['posted'] = !1;
                            var z = {};
                            z.type = 'show',
                                z['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](z)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var M = [];
                            M.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var g = this['room_mode']['detail_rule'];
                            if (g) {
                                var R = 5,
                                    E = 20;
                                if (null != g['time_fixed'] && (R = g['time_fixed']), null != g['time_add'] && (E = g['time_add']), M.push(R['toString']() + '+' + E['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var C = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    C && M.push(C.name);
                                }
                                if (null != g['init_point'] && M.push(game['Tools']['strOfLocalization'](2199) + g['init_point']), null != g['fandian'] && M.push(game['Tools']['strOfLocalization'](2094) + ':' + g['fandian']), g['guyi_mode'] && M.push(game['Tools']['strOfLocalization'](3028)), null != g['dora_count'])
                                    switch (g['chuanma'] && (g['dora_count'] = 0), g['dora_count']) {
                                        case 0:
                                            M.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            M.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            M.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            M.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != g['shiduan'] && 1 != g['shiduan'] && M.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === g['fanfu'] && M.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === g['fanfu'] && M.push(game['Tools']['strOfLocalization'](2764)),
                                    null != g['bianjietishi'] && 1 != g['bianjietishi'] && M.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != g['have_zimosun'] && 1 != g['have_zimosun'] ? M.push(game['Tools']['strOfLocalization'](2202)) : M.push(game['Tools']['strOfLocalization'](2203)));
                            }
                            this['container_rules'].show(M),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                l['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var U = 0; U < this['player_cells']['length']; U++)
                                l['UIBase']['anim_alpha_in'](this['player_cells'][U]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * U, null, Laya.Ease['backOut']);
                            l['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                l['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function() {
                                    a['locking'] = !1;
                                });
                            var B = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != B && (this['room_link'].text += '(' + B + ')');
                            var w = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + w + '?room=' + this['room_id'];
                        },
                        g['prototype']['leaveRoom'] = function() {
                            var a = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function(U, z) {
                                U || z['error'] ? l['UIMgr'].Inst['showNetReqError']('leaveRoom', U, z) : (a['room_id'] = -1, a.hide(Laya['Handler']['create'](a, function() {
                                    l['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        g['prototype']['tryToClose'] = function(a) {
                            var U = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function(z, M) {
                                z || M['error'] ? (l['UIMgr'].Inst['showNetReqError']('leaveRoom', z, M), a['runWith'](!1)) : (U['enable'] = !1, U['pop_change_view']['close'](!0), a['runWith'](!0));
                            });
                        },
                        g['prototype'].hide = function(a) {
                            var U = this;
                            this['locking'] = !0,
                                l['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var z = 0; z < this['player_cells']['length']; z++)
                                l['UIBase']['anim_alpha_out'](this['player_cells'][z]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            l['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                l['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function() {
                                    U['locking'] = !1,
                                        U['enable'] = !1,
                                        a && a.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        g['prototype']['onDisbale'] = function() {
                            Laya['timer']['clearAll'](this);
                            for (var l = 0; l < this['player_cells']['length']; l++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][l]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        g['prototype']['switchReady'] = function() {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function() {}));
                        },
                        g['prototype']['getStart'] = function() {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function(a, U) {
                                (a || U['error']) && l['UIMgr'].Inst['showNetReqError']('startRoom', a, U);
                            })));
                        },
                        g['prototype']['kickPlayer'] = function(a) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var U = this['players'][a];
                                1 == U['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][a]['account_id']
                                }, function() {}) : 2 == U['category'] && (this['pre_choose'] = U, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function(a, U) {
                                    (a || U['error']) && l['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', a, U);
                                }));
                            }
                        },
                        g['prototype']['_clearCell'] = function(l) {
                            if (!(0 > l || l >= this['player_cells']['length'])) {
                                var a = this['player_cells'][l];
                                a['container_flag']['visible'] = !1,
                                    a['container_illust']['visible'] = !1,
                                    a.name['visible'] = !1,
                                    a['container_name']['visible'] = !1,
                                    a['btn_t']['visible'] = !1,
                                    a.host['visible'] = !1;
                            }
                        },
                        g['prototype']['_refreshPlayerInfo'] = function(l) {
                            var a = l['cell_index'];
                            if (!(0 > a || a >= this['player_cells']['length'])) {
                                var U = this['player_cells'][a];
                                U['container_illust']['visible'] = !0,
                                    U['container_name']['visible'] = !0,
                                    U.name['visible'] = !0,
                                    game['Tools']['SetNickname'](U.name, l),
                                    U['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && l['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == l['account_id'] && (U['container_flag']['visible'] = !0, U.host['visible'] = !0),
                                    l['account_id'] == GameMgr.Inst['account_id'] ? U['illust']['setSkin'](l['avatar_id'], 'waitingroom') : U['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](l['avatar_id']), 'waitingroom'),
                                    U['title'].id = game['Tools']['titleLocalization'](l['account_id'], l['title']),
                                    U.rank.id = l[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](l);
                            }
                        },
                        g['prototype']['_onPlayerReadyChange'] = function(l) {
                            var a = l['cell_index'];
                            if (!(0 > a || a >= this['player_cells']['length'])) {
                                var U = this['player_cells'][a];
                                U['container_flag']['visible'] = this['owner_id'] == l['account_id'] ? !0 : l['ready'];
                            }
                        },
                        g['prototype']['refreshAsOwner'] = function() {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var l = 0, a = 0; a < this['players']['length']; a++)
                                    0 != this['players'][a]['category'] && (this['_refreshPlayerInfo'](this['players'][a]), l++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], l == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], l == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        g['prototype']['refreshStart'] = function() {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var l = 0, a = 0; a < this['players']['length']; a++) {
                                    var U = this['players'][a];
                                    if (!U || 0 == U['category'])
                                        break;
                                    (U['account_id'] == this['owner_id'] || U['ready']) && l++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], l != this['max_player_count']), this['enable']) {
                                    for (var z = 0, a = 0; a < this['max_player_count']; a++) {
                                        var M = this['player_cells'][a];
                                        M && M['container_flag']['visible'] && z++;
                                    }
                                    if (l != z && !this['posted']) {
                                        this['posted'] = !0;
                                        var g = {};
                                        g['okcount'] = l,
                                            g['okcount2'] = z,
                                            g.msgs = [];
                                        var R = 0,
                                            E = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (R = (this['msg_tail'] + 1) % this['pre_msgs']['length'], E = this['msg_tail']), R >= 0 && E >= 0) {
                                            for (var a = R; a != E; a = (a + 1) % this['pre_msgs']['length'])
                                                g.msgs.push(this['pre_msgs'][a]);
                                            g.msgs.push(this['pre_msgs'][E]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', g, !1);
                                    }
                                }
                            }
                        },
                        g['prototype']['onGameStart'] = function(l) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](l['connect_token'], l['game_uuid'], l['location'], !1, null);
                        },
                        g['prototype']['onEnable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        g['prototype']['onDisable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        g.Inst = null,
                        g;
                }
                (l['UIBase']);
            l['UI_WaitingRoom'] = M;
        }
        (uiscript || (uiscript = {}));



        // 保存装扮
        ! function(l) {
            var a;
            ! function(a) {
                var U = function() {
                        function U(U, z, M) {
                            var g = this;
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
                                this['_locking'] = M,
                                this['container_zhuangban0'] = U,
                                this['container_zhuangban1'] = z;
                            for (var R = this['container_zhuangban0']['getChildByName']('tabs'), E = function(a) {
                                    var U = R['getChildAt'](a);
                                    C.tabs.push(U),
                                        U['clickHandler'] = new Laya['Handler'](C, function() {
                                            g['locking'] || g['tab_index'] != a && (g['_changed'] ? l['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](g, function() {
                                                g['change_tab'](a);
                                            }), null) : g['change_tab'](a));
                                        });
                                }, C = this, B = 0; B < R['numChildren']; B++)
                                E(B);
                            this['page_items'] = new a['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items')),
                                this['page_headframe'] = new a['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                                this['page_bgm'] = new a['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm')),
                                this['page_desktop'] = new a['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu')),
                                this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                                this['scrollview']['setElastic'](),
                                this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                                this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                                this['btn_save']['clickHandler'] = new Laya['Handler'](this, function() {
                                    for (var a = [], U = 0; U < g['cell_titles']['length']; U++) {
                                        var z = g['slot_ids'][U];
                                        if (g['slot_map'][z]) {
                                            var M = g['slot_map'][z];
                                            if (!M || M == g['cell_default_item'][U])
                                                continue;
                                            a.push({
                                                slot: z,
                                                item_id: M
                                            });
                                        }
                                    }
                                    g['btn_save']['mouseEnabled'] = !1;
                                    var R = g['tab_index'];
                                    // START
                                    // app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                    //     views: a,
                                    //     save_index: R,
                                    //     is_use: R == l['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                    // }, function (U, z) {
                                    //     if (g['btn_save']['mouseEnabled'] = !0, U || z['error'])
                                    //         l['UIMgr'].Inst['showNetReqError']('saveCommonViews', U, z);
                                    //     else {
                                    if (l['UI_Sushe']['commonViewList']['length'] < R)
                                        for (var M = l['UI_Sushe']['commonViewList']['length']; R >= M; M++)
                                            l['UI_Sushe']['commonViewList'].push([]);
                                    MMP.settings.commonViewList = l.UI_Sushe.commonViewList;
                                    MMP.settings.using_commonview_index = l.UI_Sushe.using_commonview_index;
                                    MMP.saveSettings();
                                    //END
                                    if (l['UI_Sushe']['commonViewList'][R] = a, l['UI_Sushe']['using_commonview_index'] == R && g['onChangeGameView'](), g['tab_index'] != R)
                                        return;
                                    g['btn_save']['mouseEnabled'] = !0,
                                        g['_changed'] = !1,
                                        g['refresh_btn']();
                                    //     }
                                    // });
                                }),
                                this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                                this['btn_use']['clickHandler'] = new Laya['Handler'](this, function() {
                                    g['btn_use']['mouseEnabled'] = !1;
                                    var a = g['tab_index'];
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                        index: a
                                    }, function(U, z) {
                                        g['btn_use']['mouseEnabled'] = !0,
                                            U || z['error'] ? l['UIMgr'].Inst['showNetReqError']('useCommonView', U, z) : (l['UI_Sushe']['using_commonview_index'] = a, g['refresh_btn'](), g['refresh_tab'](), g['onChangeGameView']());
                                    });
                                });
                        }
                        return Object['defineProperty'](U['prototype'], 'locking', {
                                get: function() {
                                    return this['_locking'] ? this['_locking'].run() : !1;
                                },
                                enumerable: !1,
                                configurable: !0
                            }),
                            Object['defineProperty'](U['prototype'], 'changed', {
                                get: function() {
                                    return this['_changed'];
                                },
                                enumerable: !1,
                                configurable: !0
                            }),
                            U['prototype'].show = function(a) {
                                game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                    this['container_zhuangban0']['visible'] = !0,
                                    this['container_zhuangban1']['visible'] = !0,
                                    a ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (l['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                        x: 0
                                    }, 200), l['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                        x: 0
                                    }, 200)),
                                    this['change_tab'](l['UI_Sushe']['using_commonview_index']);
                            },
                            U['prototype']['change_tab'] = function(a) {
                                if (this['tab_index'] = a, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 4)) {
                                    if (this['tab_index'] < l['UI_Sushe']['commonViewList']['length'])
                                        for (var U = l['UI_Sushe']['commonViewList'][this['tab_index']], z = 0; z < U['length']; z++)
                                            this['slot_map'][U[z].slot] = U[z]['item_id'];
                                    this['scrollview']['addItem'](this['cell_titles']['length']),
                                        this['onChangeSlotSelect'](0),
                                        this['refresh_btn']();
                                }
                            },
                            U['prototype']['refresh_tab'] = function() {
                                for (var a = 0; a < this.tabs['length']; a++) {
                                    var U = this.tabs[a];
                                    U['mouseEnabled'] = this['tab_index'] != a,
                                        U['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == a ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                        U['getChildByName']('num')['color'] = this['tab_index'] == a ? '#2f1e19' : '#f2c797';
                                    var z = U['getChildByName']('choosed');
                                    l['UI_Sushe']['using_commonview_index'] == a ? (z['visible'] = !0, z.x = this['tab_index'] == a ? -18 : -4) : z['visible'] = !1;
                                }
                            },
                            U['prototype']['refresh_btn'] = function() {
                                this['btn_save']['visible'] = !1,
                                    this['btn_save']['mouseEnabled'] = !0,
                                    this['btn_use']['visible'] = !1,
                                    this['btn_use']['mouseEnabled'] = !0,
                                    this['btn_using']['visible'] = !1,
                                    this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = l['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = l['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                            },
                            U['prototype']['onChangeSlotSelect'] = function(l) {
                                var a = this;
                                this['select_index'] = l;
                                var U = 0;
                                l >= 0 && l < this['cell_default_item']['length'] && (U = this['cell_default_item'][l]);
                                var z = U,
                                    M = this['slot_ids'][l];
                                this['slot_map'][M] && (z = this['slot_map'][M]);
                                var g = Laya['Handler']['create'](this, function(z) {
                                    z == U && (z = 0),
                                        a['slot_map'][M] = z,
                                        a['scrollview']['wantToRefreshItem'](l),
                                        a['_changed'] = !0,
                                        a['refresh_btn']();
                                }, null, !1);
                                this['page_items']['close'](),
                                    this['page_desktop']['close'](),
                                    this['page_headframe']['close'](),
                                    this['page_bgm']['close']();
                                var R = game['Tools']['strOfLocalization'](this['cell_titles'][l]);
                                if (l >= 0 && 2 >= l)
                                    this['page_items'].show(R, l, z, g);
                                else if (3 == l)
                                    this['page_items'].show(R, 10, z, g);
                                else if (4 == l)
                                    this['page_items'].show(R, 3, z, g);
                                else if (5 == l)
                                    this['page_bgm'].show(R, z, g);
                                else if (6 == l)
                                    this['page_headframe'].show(R, z, g);
                                else if (7 == l || 8 == l) {
                                    var E = this['cell_default_item'][7],
                                        C = this['cell_default_item'][8];
                                    this['slot_map'][game['EView']['desktop']] && (E = this['slot_map'][game['EView']['desktop']]),
                                        this['slot_map'][game['EView'].mjp] && (C = this['slot_map'][game['EView'].mjp]),
                                        7 == l ? this['page_desktop']['show_desktop'](R, E, C, g) : this['page_desktop']['show_mjp'](R, E, C, g);
                                } else
                                    9 == l && this['page_desktop']['show_lobby_bg'](R, z, g);
                            },
                            U['prototype']['render_view'] = function(l) {
                                var a = this,
                                    U = l['container'],
                                    z = l['index'],
                                    M = U['getChildByName']('cell');
                                this['select_index'] == z ? (M['scaleX'] = M['scaleY'] = 1.05, M['getChildByName']('choosed')['visible'] = !0) : (M['scaleX'] = M['scaleY'] = 1, M['getChildByName']('choosed')['visible'] = !1),
                                    M['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][z]);
                                var g = M['getChildByName']('name'),
                                    R = M['getChildByName']('icon'),
                                    E = this['cell_default_item'][z],
                                    C = this['slot_ids'][z];
                                this['slot_map'][C] && (E = this['slot_map'][C]);
                                var B = cfg['item_definition'].item.get(E);
                                B ? (g.text = B['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](R, B.icon, null, 'UI_Sushe_Select.Zhuangban')) : (g.text = game['Tools']['strOfLocalization'](this['cell_names'][z]), game['LoadMgr']['setImgSkin'](R, this['cell_default_img'][z], null, 'UI_Sushe_Select.Zhuangban'));
                                var w = M['getChildByName']('btn');
                                w['clickHandler'] = Laya['Handler']['create'](this, function() {
                                        a['locking'] || a['select_index'] != z && (a['onChangeSlotSelect'](z), a['scrollview']['wantToRefreshAll']());
                                    }, null, !1),
                                    w['mouseEnabled'] = this['select_index'] != z;
                            },
                            U['prototype']['close'] = function(a) {
                                var U = this;
                                this['container_zhuangban0']['visible'] && (a ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (l['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), l['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200, 0, Laya['Handler']['create'](this, function() {
                                    U['page_items']['close'](),
                                        U['page_desktop']['close'](),
                                        U['page_headframe']['close'](),
                                        U['page_bgm']['close'](),
                                        U['container_zhuangban0']['visible'] = !1,
                                        U['container_zhuangban1']['visible'] = !1,
                                        game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                                }))));
                            },
                            U['prototype']['onChangeGameView'] = function() {
                                // 保存装扮页
                                MMP.settings.using_commonview_index = l.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                // END
                                GameMgr.Inst['load_mjp_view']();
                                var a = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                                l['UI_Lite_Loading'].Inst.show(),
                                    game['Scene_Lobby'].Inst['set_lobby_bg'](a, Laya['Handler']['create'](this, function() {
                                        l['UI_Lite_Loading'].Inst['enable'] && l['UI_Lite_Loading'].Inst['close']();
                                    })),
                                    GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                            },
                            U;
                    }
                    ();
                a['Container_Zhuangban'] = U;
            }
            (a = l['zhuangban'] || (l['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));




        // 设置称号
        ! function(l) {
            var a = function(a) {
                    function U() {
                        var l = a.call(this, new ui['lobby']['titlebookUI']()) || this;
                        return l['_root'] = null,
                            l['_scrollview'] = null,
                            l['_blackmask'] = null,
                            l['_locking'] = !1,
                            l['_showindexs'] = [],
                            U.Inst = l,
                            l;
                    }
                    return __extends(U, a),
                        U.Init = function() {
                            var a = this;
                            // 获取称号
                            // app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (U, z) {
                            //     if (U || z['error'])
                            //         l['UIMgr'].Inst['showNetReqError']('fetchTitleList', U, z);
                            //     else {
                            a['owned_title'] = [];
                            //         for (var M = 0; M < z['title_list']['length']; M++) {
                            //             var g = z['title_list'][M];

                            for (let title of cfg.item_definition.title.rows_) {
                                var g = title.id;
                                cfg['item_definition']['title'].get(g) && a['owned_title'].push(g),
                                    '600005' == g && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                    g >= '600005' && '600015' >= g && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + g - '600005', 1);
                            }
                            //     }
                            // });
                        },
                        U['title_update'] = function(a) {
                            for (var U = 0; U < a['new_titles']['length']; U++)
                                cfg['item_definition']['title'].get(a['new_titles'][U]) && this['owned_title'].push(a['new_titles'][U]), '600005' == a['new_titles'][U] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), a['new_titles'][U] >= '600005' && a['new_titles'][U] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + a['new_titles'][U] - '600005', 1);
                            if (a['remove_titles'] && a['remove_titles']['length'] > 0) {
                                for (var U = 0; U < a['remove_titles']['length']; U++) {
                                    for (var z = a['remove_titles'][U], M = 0; M < this['owned_title']['length']; M++)
                                        if (this['owned_title'][M] == z) {
                                            this['owned_title'][M] = this['owned_title'][this['owned_title']['length'] - 1],
                                                this['owned_title'].pop();
                                            break;
                                        }
                                    z == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', l['UI_Lobby'].Inst['enable'] && l['UI_Lobby'].Inst.top['refresh'](), l['UI_PlayerInfo'].Inst['enable'] && l['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                                }
                                this.Inst['enable'] && this.Inst.show();
                            }
                        },
                        U['prototype']['onCreate'] = function() {
                            var a = this;
                            this['_root'] = this.me['getChildByName']('root'),
                                this['_blackmask'] = new l['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function() {
                                    return a['_locking'];
                                }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                                this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                                this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function(l) {
                                    a['setItemValue'](l['index'], l['container']);
                                }, null, !1)),
                                this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    a['_locking'] || (a['_blackmask'].hide(), a['close']());
                                }, null, !1),
                                this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                        },
                        U['prototype'].show = function() {
                            var a = this;
                            if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), U['owned_title']['length'] > 0) {
                                this['_showindexs'] = [];
                                for (var z = 0; z < U['owned_title']['length']; z++)
                                    this['_showindexs'].push(z);
                                this['_showindexs'] = this['_showindexs'].sort(function(l, a) {
                                        var z = l,
                                            M = cfg['item_definition']['title'].get(U['owned_title'][l]);
                                        M && (z += 1000 * M['priority']);
                                        var g = a,
                                            R = cfg['item_definition']['title'].get(U['owned_title'][a]);
                                        return R && (g += 1000 * R['priority']),
                                            g - z;
                                    }),
                                    this['_scrollview']['reset'](),
                                    this['_scrollview']['addItem'](U['owned_title']['length']),
                                    this['_scrollview'].me['visible'] = !0,
                                    this['_noinfo']['visible'] = !1;
                            } else
                                this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                            l['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function() {
                                a['_locking'] = !1;
                            }));
                        },
                        U['prototype']['close'] = function() {
                            var a = this;
                            this['_locking'] = !0,
                                l['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function() {
                                    a['_locking'] = !1,
                                        a['enable'] = !1;
                                }));
                        },
                        U['prototype']['onEnable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                        },
                        U['prototype']['onDisable'] = function() {
                            game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                                this['_scrollview']['reset']();
                        },
                        U['prototype']['setItemValue'] = function(l, a) {
                            var z = this;
                            if (this['enable']) {
                                var M = U['owned_title'][this['_showindexs'][l]],
                                    g = cfg['item_definition']['title'].find(M);
                                game['LoadMgr']['setImgSkin'](a['getChildByName']('img_title'), g.icon, null, 'UI_TitleBook'),
                                    a['getChildByName']('using')['visible'] = M == GameMgr.Inst['account_data']['title'],
                                    a['getChildByName']('desc').text = g['desc_' + GameMgr['client_language']];
                                var R = a['getChildByName']('btn');
                                R['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    M != GameMgr.Inst['account_data']['title'] ? (z['changeTitle'](l), a['getChildByName']('using')['visible'] = !0) : (z['changeTitle'](-1), a['getChildByName']('using')['visible'] = !1);
                                }, null, !1);
                                var E = a['getChildByName']('time'),
                                    C = a['getChildByName']('img_title');
                                if (1 == g['unlock_type']) {
                                    var B = g['unlock_param'][0],
                                        w = cfg['item_definition'].item.get(B);
                                    E.text = game['Tools']['strOfLocalization'](3121) + w['expire_desc_' + GameMgr['client_language']],
                                        E['visible'] = !0,
                                        C.y = 0;
                                } else
                                    E['visible'] = !1, C.y = 10;
                            }
                        },
                        U['prototype']['changeTitle'] = function(a) {
                            var z = this,
                                M = GameMgr.Inst['account_data']['title'],
                                g = 0;
                            g = a >= 0 && a < this['_showindexs']['length'] ? U['owned_title'][this['_showindexs'][a]] : '600001',
                                GameMgr.Inst['account_data']['title'] = g;
                            for (var R = -1, E = 0; E < this['_showindexs']['length']; E++)
                                if (M == U['owned_title'][this['_showindexs'][E]]) {
                                    R = E;
                                    break;
                                }
                            l['UI_Lobby'].Inst['enable'] && l['UI_Lobby'].Inst.top['refresh'](),
                                l['UI_PlayerInfo'].Inst['enable'] && l['UI_PlayerInfo'].Inst['refreshBaseInfo'](), -1 != R && this['_scrollview']['wantToRefreshItem'](R),
                                // 屏蔽设置称号的网络请求并保存称号
                                MMP.settings.title = g;
                            MMP.saveSettings();
                            // app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                            //     title: '600001' == g ? 0 : g
                            // }, function (U, g) {
                            //     (U || g['error']) && (l['UIMgr'].Inst['showNetReqError']('useTitle', U, g), GameMgr.Inst['account_data']['title'] = M, l['UI_Lobby'].Inst['enable'] && l['UI_Lobby'].Inst.top['refresh'](), l['UI_PlayerInfo'].Inst['enable'] && l['UI_PlayerInfo'].Inst['refreshBaseInfo'](), z['enable'] && (a >= 0 && a < z['_showindexs']['length'] && z['_scrollview']['wantToRefreshItem'](a), R >= 0 && R < z['_showindexs']['length'] && z['_scrollview']['wantToRefreshItem'](R)));
                            // });
                        },
                        U.Inst = null,
                        U['owned_title'] = [],
                        U;
                }
                (l['UIBase']);
            l['UI_TitleBook'] = a;
        }
        (uiscript || (uiscript = {}));




        // 友人房调整装扮
        ! function(l) {
            var a;
            ! function(a) {
                var U = function() {
                        function U(l) {
                            this['scrollview'] = null,
                                this['page_skin'] = null,
                                this['chara_infos'] = [],
                                this['choosed_chara_index'] = 0,
                                this['choosed_skin_id'] = 0,
                                this['star_char_count'] = 0,
                                this.me = l,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                                this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                                this['scrollview']['setElastic'](),
                                this['page_skin'] = new a['Page_Skin'](this.me['getChildByName']('right'));
                        }
                        return U['prototype'].show = function(a) {
                                var U = this;
                                this.me['visible'] = !0,
                                    a ? this.me['alpha'] = 1 : l['UIBase']['anim_alpha_in'](this.me, {
                                        x: 0
                                    }, 200, 0),
                                    this['choosed_chara_index'] = 0,
                                    this['chara_infos'] = [];
                                for (var z = 0, M = l['UI_Sushe']['star_chars']; z < M['length']; z++)
                                    for (var g = M[z], R = 0; R < l['UI_Sushe']['characters']['length']; R++)
                                        if (!l['UI_Sushe']['hidden_characters_map'][g] && l['UI_Sushe']['characters'][R]['charid'] == g) {
                                            this['chara_infos'].push({
                                                    chara_id: l['UI_Sushe']['characters'][R]['charid'],
                                                    skin_id: l['UI_Sushe']['characters'][R].skin,
                                                    is_upgraded: l['UI_Sushe']['characters'][R]['is_upgraded']
                                                }),
                                                l['UI_Sushe']['main_character_id'] == l['UI_Sushe']['characters'][R]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                            break;
                                        }
                                this['star_char_count'] = this['chara_infos']['length'];
                                for (var R = 0; R < l['UI_Sushe']['characters']['length']; R++)
                                    l['UI_Sushe']['hidden_characters_map'][l['UI_Sushe']['characters'][R]['charid']] || -1 == l['UI_Sushe']['star_chars']['indexOf'](l['UI_Sushe']['characters'][R]['charid']) && (this['chara_infos'].push({
                                        chara_id: l['UI_Sushe']['characters'][R]['charid'],
                                        skin_id: l['UI_Sushe']['characters'][R].skin,
                                        is_upgraded: l['UI_Sushe']['characters'][R]['is_upgraded']
                                    }), l['UI_Sushe']['main_character_id'] == l['UI_Sushe']['characters'][R]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                                this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                                    this['scrollview']['reset'](),
                                    this['scrollview']['addItem'](this['chara_infos']['length']);
                                var E = this['chara_infos'][this['choosed_chara_index']];
                                this['page_skin'].show(E['chara_id'], E['skin_id'], Laya['Handler']['create'](this, function(l) {
                                    U['choosed_skin_id'] = l,
                                        E['skin_id'] = l,
                                        U['scrollview']['wantToRefreshItem'](U['choosed_chara_index']);
                                }, null, !1));
                            },
                            U['prototype']['render_character_cell'] = function(a) {
                                var U = this,
                                    z = a['index'],
                                    M = a['container'],
                                    g = a['cache_data'];
                                g['index'] = z;
                                var R = this['chara_infos'][z];
                                g['inited'] || (g['inited'] = !0, g.skin = new l['UI_Character_Skin'](M['getChildByName']('btn')['getChildByName']('head')), g['bound'] = M['getChildByName']('btn')['getChildByName']('bound'));
                                var E = M['getChildByName']('btn');
                                E['getChildByName']('choose')['visible'] = z == this['choosed_chara_index'],
                                    g.skin['setSkin'](R['skin_id'], 'bighead'),
                                    E['getChildByName']('using')['visible'] = z == this['choosed_chara_index'],
                                    E['getChildByName']('label_name').text = 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? cfg['item_definition']['character'].find(R['chara_id'])['name_' + GameMgr['client_language']]['replace']('-', '|') : cfg['item_definition']['character'].find(R['chara_id'])['name_' + GameMgr['client_language']],
                                    E['getChildByName']('star') && (E['getChildByName']('star')['visible'] = z < this['star_char_count']);
                                var C = cfg['item_definition']['character'].get(R['chara_id']);
                                'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? g['bound'].skin = C.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (R['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (R['is_upgraded'] ? '2.png' : '.png')) : C.ur ? (g['bound'].pos(-10, -2), g['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (R['is_upgraded'] ? '6.png' : '5.png'))) : (g['bound'].pos(4, 20), g['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (R['is_upgraded'] ? '4.png' : '3.png'))),
                                    E['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (R['is_upgraded'] ? '2.png' : '.png')),
                                    M['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                        if (z != U['choosed_chara_index']) {
                                            var l = U['choosed_chara_index'];
                                            U['choosed_chara_index'] = z,
                                                U['choosed_skin_id'] = R['skin_id'],
                                                U['page_skin'].show(R['chara_id'], R['skin_id'], Laya['Handler']['create'](U, function(l) {
                                                    U['choosed_skin_id'] = l,
                                                        R['skin_id'] = l,
                                                        g.skin['setSkin'](l, 'bighead');
                                                }, null, !1)),
                                                U['scrollview']['wantToRefreshItem'](l),
                                                U['scrollview']['wantToRefreshItem'](z);
                                        }
                                    });
                            },
                            U['prototype']['close'] = function(a) {
                                var U = this;
                                if (this.me['visible'])
                                    if (a)
                                        this.me['visible'] = !1;
                                    else {
                                        var z = this['chara_infos'][this['choosed_chara_index']];
                                        //把chartid和skin写入cookie
                                        MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                        MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                        MMP.saveSettings();
                                        // End
                                        // 友人房调整装扮
                                        // z['chara_id'] != l['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                        //         character_id: z['chara_id']
                                        //     }, function () {}), 
                                        l['UI_Sushe']['main_character_id'] = z['chara_id'];
                                        //  this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                        //      character_id: z['chara_id'],
                                        //      skin: this['choosed_skin_id']
                                        //  }, function () {});
                                        // END
                                        for (var M = 0; M < l['UI_Sushe']['characters']['length']; M++)
                                            if (l['UI_Sushe']['characters'][M]['charid'] == z['chara_id']) {
                                                l['UI_Sushe']['characters'][M].skin = this['choosed_skin_id'];
                                                break;
                                            }
                                        GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                            l['UIBase']['anim_alpha_out'](this.me, {
                                                x: 0
                                            }, 200, 0, Laya['Handler']['create'](this, function() {
                                                U.me['visible'] = !1;
                                            }));
                                    }
                            },
                            U;
                    }
                    ();
                a['Page_Waiting_Head'] = U;
            }
            (a = l['zhuangban'] || (l['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));




        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function() {
            var l = GameMgr;
            var a = this;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function(U, z) {
                if (U || z['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', U, z);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](z)),
                        GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    z.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    z.account.title = GameMgr.Inst.account_data.title;
                    z.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        z.account.nickname = MMP.settings.nickname;
                    }
                    // end
                    for (var M in z['account']) {
                        if (l.Inst['account_data'][M] = z['account'][M], 'platform_diamond' == M)
                            for (var g = z['account'][M], R = 0; R < g['length']; R++)
                                a['account_numerical_resource'][g[R].id] = g[R]['count'];
                        if ('skin_ticket' == M && (l.Inst['account_numerical_resource']['100004'] = z['account'][M]), 'platform_skin_ticket' == M)
                            for (var g = z['account'][M], R = 0; R < g['length']; R++)
                                a['account_numerical_resource'][g[R].id] = g[R]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        z['account']['room_id'] && l.Inst['updateRoom'](),
                        '10102' === l.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === l.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }


        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function(a, U, z) {
            (GM_xmlhttpRequest({
                method: 'post',
                url: MMP.settings.sendGameURL,
                data: JSON.stringify({
                    'current_record_uuid': a,
                    'account_id': parseInt(U.toString())
                }),
                onload: function(msg) {
                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                        'current_record_uuid': a,
                        'account_id': parseInt(U.toString())
                    }));
                }
            }));
            var M = GameMgr.Inst;
            var l = GameMgr;
            return a = a.trim(),
                app.Log.log('checkPaiPu game_uuid:' + a + ' account_id:' + U['toString']() + ' paipu_config:' + z),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), l.Inst['onLoadStart']('paipu'), 2 & z && (a = game['Tools']['DecodePaipuUUID'](a)), this['record_uuid'] = a, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: a,
                    client_version_string: this['getClientVersion']()
                }, function(g, R) {
                    if (g || R['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', g, R);
                        var E = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](E);
                        var C = function() {
                            return E += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, E)),
                                E >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, C), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, M, C),
                            M['duringPaipu'] = !1;
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
                        var B = R.head,
                            w = [null, null, null, null],
                            L = game['Tools']['strOfLocalization'](2003),
                            c = B['config'].mode;
                        if (l['inRelease'] && c['testing_environment'] && c['testing_environment']['paixing'])
                            return uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3169)), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), M['duringPaipu'] = !1, void 0;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                                game_uuid: a,
                                client_version_string: M['getClientVersion']()
                            }, function() {}),
                            c['extendinfo'] && (L = game['Tools']['strOfLocalization'](2004)),
                            c['detail_rule'] && c['detail_rule']['ai_level'] && (1 === c['detail_rule']['ai_level'] && (L = game['Tools']['strOfLocalization'](2003)), 2 === c['detail_rule']['ai_level'] && (L = game['Tools']['strOfLocalization'](2004)));
                        var h = !1;
                        B['end_time'] ? (M['record_end_time'] = B['end_time'], B['end_time'] > '1576112400' && (h = !0)) : M['record_end_time'] = -1,
                            M['record_start_time'] = B['start_time'] ? B['start_time'] : -1;
                        for (var x = 0; x < B['accounts']['length']; x++) {
                            var O = B['accounts'][x];
                            if (O['character']) {
                                var _ = O['character'],
                                    p = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (O.account_id == GameMgr.Inst.account_id) {
                                        O.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        O.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        O.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        O.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        O.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            O.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (O.avatar_id == 400101 || O.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            O.avatar_id = skin.id;
                                            O.character.charid = skin.character_id;
                                            O.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(O.account_id);
                                        if (server == 1) {
                                            O.nickname = '[CN]' + O.nickname;
                                        } else if (server == 2) {
                                            O.nickname = '[JP]' + O.nickname;
                                        } else if (server == 3) {
                                            O.nickname = '[EN]' + O.nickname;
                                        } else {
                                            O.nickname = '[??]' + O.nickname;
                                        }
                                    }
                                }
                                // END
                                if (h) {
                                    var N = O['views'];
                                    if (N)
                                        for (var n = 0; n < N['length']; n++)
                                            p[N[n].slot] = N[n]['item_id'];
                                } else {
                                    var P = _['views'];
                                    if (P)
                                        for (var n = 0; n < P['length']; n++) {
                                            var H = P[n].slot,
                                                Z = P[n]['item_id'],
                                                b = H - 1;
                                            p[b] = Z;
                                        }
                                }
                                var W = [];
                                for (var d in p)
                                    W.push({
                                        slot: parseInt(d),
                                        item_id: p[d]
                                    });
                                O['views'] = W,
                                    w[O.seat] = O;
                            } else
                                O['character'] = {
                                    charid: O['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(O['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                O['avatar_id'] = O['character'].skin,
                                O['views'] = [],
                                w[O.seat] = O;
                        }
                        for (var u = game['GameUtility']['get_default_ai_skin'](), m = game['GameUtility']['get_default_ai_character'](), x = 0; x < w['length']; x++)
                            if (null == w[x]) {
                                w[x] = {
                                    nickname: L,
                                    avatar_id: u,
                                    level: {
                                        id: '10101'
                                    },
                                    level3: {
                                        id: '20101'
                                    },
                                    character: {
                                        charid: m,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: u,
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
                                            w[x].avatar_id = skin.id;
                                            w[x].character.charid = skin.character_id;
                                            w[x].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        w[x].nickname = '[BOT]' + w[x].nickname;
                                    }
                                }
                                // END
                            }
                        var i = Laya['Handler']['create'](M, function(l) {
                                game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                    game['Scene_MJ'].Inst['openMJRoom'](B['config'], w, Laya['Handler']['create'](M, function() {
                                        M['duringPaipu'] = !1,
                                            view['DesktopMgr'].Inst['paipu_config'] = z,
                                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](B['config'])), w, U, view['EMJMode']['paipu'], Laya['Handler']['create'](M, function() {
                                                uiscript['UI_Replay'].Inst['initData'](l),
                                                    uiscript['UI_Replay'].Inst['enable'] = !0,
                                                    Laya['timer'].once(1000, M, function() {
                                                        M['EnterMJ']();
                                                    }),
                                                    Laya['timer'].once(1500, M, function() {
                                                        view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                            uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                            uiscript['UI_Loading'].Inst['close']();
                                                    }),
                                                    Laya['timer'].once(1000, M, function() {
                                                        uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                    });
                                            }));
                                    }), Laya['Handler']['create'](M, function(l) {
                                        return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * l);
                                    }, null, !1));
                            }),
                            q = {};
                        if (q['record'] = B, R.data && R.data['length'])
                            q.game = net['MessageWrapper']['decodeMessage'](R.data), i['runWith'](q);
                        else {
                            var T = R['data_url'];
                            'chs_t' == l['client_type'] && (T = T['replace']('maj-soul.com:9443', 'maj-soul.net')),
                                game['LoadMgr']['httpload'](T, 'arraybuffer', !1, Laya['Handler']['create'](M, function(l) {
                                    if (l['success']) {
                                        var a = new Laya.Byte();
                                        a['writeArrayBuffer'](l.data);
                                        var U = net['MessageWrapper']['decodeMessage'](a['getUint8Array'](0, a['length']));
                                        q.game = U,
                                            i['runWith'](q);
                                    } else
                                        uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + R['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), M['duringPaipu'] = !1;
                                }));
                        }
                    }
                }), void 0);
        }


        // 牌谱功能
        ! function(l) {
            var a = function() {
                    function a(l) {
                        var a = this;
                        this.me = l,
                            this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                a['locking'] || a.hide(null);
                            }),
                            this['title'] = this.me['getChildByName']('title'),
                            this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                            this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                            this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                            this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                            this.me['visible'] = !1,
                            this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                a['locking'] || a.hide(null);
                            }, null, !1),
                            this['container_hidename'] = this.me['getChildByName']('hidename'),
                            this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                        var U = this['container_hidename']['getChildByName']('w0'),
                            z = this['container_hidename']['getChildByName']('w1');
                        z.x = U.x + U['textField']['textWidth'] + 10,
                            this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function() {
                                a['sp_checkbox']['visible'] = !a['sp_checkbox']['_type'],
                                    a['refresh_share_uuid']();
                            });
                    }
                    return a['prototype']['show_share'] = function(a) {
                            var U = this;
                            this['title'].text = game['Tools']['strOfLocalization'](2124),
                                this['sp_checkbox']['visible'] = !1,
                                this['btn_confirm']['visible'] = !1,
                                this['input']['editable'] = !1,
                                this.uuid = a,
                                this['refresh_share_uuid'](),
                                this.me['visible'] = !0,
                                this['locking'] = !0,
                                this['container_hidename']['visible'] = !0,
                                this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                                l['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function() {
                                    U['locking'] = !1;
                                }));
                        },
                        a['prototype']['refresh_share_uuid'] = function() {
                            var l = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                                a = this.uuid,
                                U = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + U + '?paipu=' + game['Tools']['EncodePaipuUUID'](a) + '_a' + l + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + U + '?paipu=' + a + '_a' + l;
                        },
                        a['prototype']['show_check'] = function() {
                            var a = this;
                            return l['UI_PiPeiYuYue'].Inst['enable'] ? (l['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                return a['input'].text ? (a.hide(Laya['Handler']['create'](a, function() {
                                    var l = a['input'].text['split']('='),
                                        U = l[l['length'] - 1]['split']('_'),
                                        z = 0;
                                    U['length'] > 1 && (z = 'a' == U[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(U[1]['substr'](1))) : parseInt(U[1]));
                                    var M = 0;
                                    if (U['length'] > 2) {
                                        var g = parseInt(U[2]);
                                        g && (M = g);
                                    }
                                    GameMgr.Inst['checkPaiPu'](U[0], z, M);
                                })), void 0) : (l['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                            }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, l['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function() {
                                a['locking'] = !1;
                            })), void 0);
                        },
                        a['prototype'].hide = function(a) {
                            var U = this;
                            this['locking'] = !0,
                                l['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function() {
                                    U['locking'] = !1,
                                        U.me['visible'] = !1,
                                        a && a.run();
                                }));
                        },
                        a;
                }
                (),
                U = function() {
                    function a(l) {
                        var a = this;
                        this.me = l,
                            this['blackbg'] = l['getChildByName']('blackbg'),
                            this.root = l['getChildByName']('root'),
                            this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function() {
                                a['locking'] || a['close']();
                            }),
                            this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function() {
                                a['locking'] || (game['Tools']['calu_word_length'](a['input'].text) > 30 ? a['toolong']['visible'] = !0 : (a['close'](), g['addCollect'](a.uuid, a['start_time'], a['end_time'], a['input'].text)));
                            }),
                            this['toolong'] = this.root['getChildByName']('toolong');
                    }
                    return a['prototype'].show = function(a, U, z) {
                            var M = this;
                            this.uuid = a,
                                this['start_time'] = U,
                                this['end_time'] = z,
                                this.me['visible'] = !0,
                                this['locking'] = !0,
                                this['input'].text = '',
                                this['toolong']['visible'] = !1,
                                this['blackbg']['alpha'] = 0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0.5
                                }, 150),
                                l['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function() {
                                    M['locking'] = !1;
                                }));
                        },
                        a['prototype']['close'] = function() {
                            var a = this;
                            this['locking'] = !0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0
                                }, 150),
                                l['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function() {
                                    a['locking'] = !1,
                                        a.me['visible'] = !1;
                                }));
                        },
                        a;
                }
                ();
            l['UI_Pop_CollectInput'] = U;
            var z;
            ! function(l) {
                l[l.ALL = 0] = 'ALL',
                    l[l['FRIEND'] = 1] = 'FRIEND',
                    l[l.RANK = 2] = 'RANK',
                    l[l['MATCH'] = 4] = 'MATCH',
                    l[l['COLLECT'] = 100] = 'COLLECT';
            }
            (z || (z = {}));
            var M = function() {
                    function a(l) {
                        this['uuid_list'] = [],
                            this.type = l,
                            this['reset']();
                    }
                    return a['prototype']['reset'] = function() {
                            this['count'] = 0,
                                this['true_count'] = 0,
                                this['have_more_paipu'] = !0,
                                this['uuid_list'] = [],
                                this['duringload'] = !1;
                        },
                        a['prototype']['loadList'] = function() {
                            var a = this;
                            if (!this['duringload'] && this['have_more_paipu']) {
                                if (this['duringload'] = !0, this.type == z['COLLECT']) {
                                    for (var U = [], M = 0, R = 0; 10 > R; R++) {
                                        var E = this['count'] + R;
                                        if (E >= g['collect_lsts']['length'])
                                            break;
                                        M++;
                                        var C = g['collect_lsts'][E];
                                        g['record_map'][C] || U.push(C),
                                            this['uuid_list'].push(C);
                                    }
                                    U['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                        uuid_list: U
                                    }, function(z, R) {
                                        if (a['duringload'] = !1, g.Inst['onLoadStateChange'](a.type, !1), z || R['error'])
                                            l['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', z, R);
                                        else if (app.Log.log(JSON['stringify'](R)), R['record_list'] && R['record_list']['length'] == U['length']) {
                                            for (var E = 0; E < R['record_list']['length']; E++) {
                                                var C = R['record_list'][E].uuid;
                                                g['record_map'][C] || (g['record_map'][C] = R['record_list'][E]);
                                            }
                                            a['count'] += M,
                                                a['count'] >= g['collect_lsts']['length'] && (a['have_more_paipu'] = !1, g.Inst['onLoadOver'](a.type)),
                                                g.Inst['onLoadMoreLst'](a.type, M);
                                        } else
                                            a['have_more_paipu'] = !1, g.Inst['onLoadOver'](a.type);
                                    }) : (this['duringload'] = !1, this['count'] += M, this['count'] >= g['collect_lsts']['length'] && (this['have_more_paipu'] = !1, g.Inst['onLoadOver'](this.type)), g.Inst['onLoadMoreLst'](this.type, M));
                                } else
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                        start: this['true_count'],
                                        count: 10,
                                        type: this.type
                                    }, function(U, M) {
                                        if (a['duringload'] = !1, g.Inst['onLoadStateChange'](a.type, !1), U || M['error'])
                                            l['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', U, M);
                                        else if (app.Log.log(JSON['stringify'](M)), M['record_list'] && M['record_list']['length'] > 0) {
                                            // START
                                            if (MMP.settings.sendGame == true) {
                                                (GM_xmlhttpRequest({
                                                    method: 'post',
                                                    url: MMP.settings.sendGameURL,
                                                    data: JSON.stringify(M),
                                                    onload: function(msg) {
                                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(M));
                                                    }
                                                }));
                                                for (let record_list of M['record_list']) {
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
                                            for (var R = M['record_list'], E = 0, C = 0; C < R['length']; C++) {
                                                var B = R[C].uuid;
                                                if (a.type == z.RANK && R[C]['config'] && R[C]['config'].meta) {
                                                    var w = R[C]['config'].meta;
                                                    if (w) {
                                                        var L = cfg['desktop']['matchmode'].get(w['mode_id']);
                                                        if (L && 5 == L.room)
                                                            continue;
                                                    }
                                                }
                                                E++,
                                                a['uuid_list'].push(B),
                                                    g['record_map'][B] || (g['record_map'][B] = R[C]);
                                            }
                                            a['count'] += E,
                                                a['true_count'] += R['length'],
                                                g.Inst['onLoadMoreLst'](a.type, E),
                                                a['have_more_paipu'] = !0;
                                        } else
                                            a['have_more_paipu'] = !1, g.Inst['onLoadOver'](a.type);
                                    });
                                Laya['timer'].once(700, this, function() {
                                    a['duringload'] && g.Inst['onLoadStateChange'](a.type, !0);
                                });
                            }
                        },
                        a['prototype']['removeAt'] = function(l) {
                            for (var a = 0; a < this['uuid_list']['length'] - 1; a++)
                                a >= l && (this['uuid_list'][a] = this['uuid_list'][a + 1]);
                            this['uuid_list'].pop(),
                                this['count']--,
                                this['true_count']--;
                        },
                        a;
                }
                (),
                g = function(g) {
                    function R() {
                        var l = g.call(this, new ui['lobby']['paipuUI']()) || this;
                        return l.top = null,
                            l['container_scrollview'] = null,
                            l['scrollview'] = null,
                            l['loading'] = null,
                            l.tabs = [],
                            l['pop_otherpaipu'] = null,
                            l['pop_collectinput'] = null,
                            l['label_collect_count'] = null,
                            l['noinfo'] = null,
                            l['locking'] = !1,
                            l['current_type'] = z.ALL,
                            R.Inst = l,
                            l;
                    }
                    return __extends(R, g),
                        R.init = function() {
                            var l = this;
                            this['paipuLst'][z.ALL] = new M(z.ALL),
                                this['paipuLst'][z['FRIEND']] = new M(z['FRIEND']),
                                this['paipuLst'][z.RANK] = new M(z.RANK),
                                this['paipuLst'][z['MATCH']] = new M(z['MATCH']),
                                this['paipuLst'][z['COLLECT']] = new M(z['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function(a, U) {
                                    if (a || U['error']);
                                    else {
                                        if (U['record_list']) {
                                            for (var z = U['record_list'], M = 0; M < z['length']; M++) {
                                                var g = {
                                                    uuid: z[M].uuid,
                                                    time: z[M]['end_time'],
                                                    remarks: z[M]['remarks']
                                                };
                                                l['collect_lsts'].push(g.uuid),
                                                    l['collect_info'][g.uuid] = g;
                                            }
                                            l['collect_lsts'] = l['collect_lsts'].sort(function(a, U) {
                                                return l['collect_info'][U].time - l['collect_info'][a].time;
                                            });
                                        }
                                        U['record_collect_limit'] && (l['collect_limit'] = U['record_collect_limit']);
                                    }
                                });
                        },
                        R['onAccountUpdate'] = function() {
                            this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                        },
                        R['reset'] = function() {
                            this['paipuLst'][z.ALL] && this['paipuLst'][z.ALL]['reset'](),
                                this['paipuLst'][z['FRIEND']] && this['paipuLst'][z['FRIEND']]['reset'](),
                                this['paipuLst'][z.RANK] && this['paipuLst'][z.RANK]['reset'](),
                                this['paipuLst'][z['MATCH']] && this['paipuLst'][z['MATCH']]['reset']();
                        },
                        R['addCollect'] = function(a, U, z, M) {
                            var g = this;
                            if (!this['collect_info'][a]) {
                                if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                                    return l['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                                    uuid: a,
                                    remarks: M,
                                    start_time: U,
                                    end_time: z
                                }, function() {});
                                var E = {
                                    uuid: a,
                                    remarks: M,
                                    time: z
                                };
                                this['collect_info'][a] = E,
                                    this['collect_lsts'].push(a),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function(l, a) {
                                        return g['collect_info'][a].time - g['collect_info'][l].time;
                                    }),
                                    l['UI_DesktopInfo'].Inst && l['UI_DesktopInfo'].Inst['enable'] && l['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    R.Inst && R.Inst['enable'] && R.Inst['onCollectChange'](a, -1);
                            }
                        },
                        R['removeCollect'] = function(a) {
                            var U = this;
                            if (this['collect_info'][a]) {
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                                        uuid: a
                                    }, function() {}),
                                    delete this['collect_info'][a];
                                for (var z = -1, M = 0; M < this['collect_lsts']['length']; M++)
                                    if (this['collect_lsts'][M] == a) {
                                        this['collect_lsts'][M] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                            z = M;
                                        break;
                                    }
                                this['collect_lsts'].pop(),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function(l, a) {
                                        return U['collect_info'][a].time - U['collect_info'][l].time;
                                    }),
                                    l['UI_DesktopInfo'].Inst && l['UI_DesktopInfo'].Inst['enable'] && l['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    R.Inst && R.Inst['enable'] && R.Inst['onCollectChange'](a, z);
                            }
                        },
                        R['prototype']['onCreate'] = function() {
                            var z = this;
                            this.top = this.me['getChildByName']('top'),
                                this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    z['locking'] || z['close'](Laya['Handler']['create'](z, function() {
                                        l['UIMgr'].Inst['showLobby']();
                                    }));
                                }, null, !1),
                                this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                                this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function(l) {
                                    z['setItemValue'](l['index'], l['container']);
                                }, null, !1)),
                                this['scrollview']['setElastic'](),
                                this['container_scrollview'].on('ratechange', this, function() {
                                    var l = R['paipuLst'][z['current_type']];
                                    (1 - z['scrollview'].rate) * l['count'] < 3 && (l['duringload'] || (l['have_more_paipu'] ? l['loadList']() : 0 == l['count'] && (z['noinfo']['visible'] = !0)));
                                }),
                                this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                                this['loading']['visible'] = !1,
                                this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    z['pop_otherpaipu'].me['visible'] || z['pop_otherpaipu']['show_check']();
                                }, null, !1),
                                this.tabs = [];
                            for (var M = 0; 5 > M; M++)
                                this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](M)), this.tabs[M]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [M, !1]);
                            this['pop_otherpaipu'] = new a(this.me['getChildByName']('pop_otherpaipu')),
                                this['pop_collectinput'] = new U(this.me['getChildByName']('pop_collect')),
                                this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                                this['label_collect_count'].text = '0/20',
                                this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                        },
                        R['prototype'].show = function() {
                            var a = this;
                            GameMgr.Inst['BehavioralStatistics'](20),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['pop_otherpaipu'].me['visible'] = !1,
                                this['pop_collectinput'].me['visible'] = !1,
                                l['UIBase']['anim_alpha_in'](this.top, {
                                    y: -30
                                }, 200),
                                l['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                                    y: 30
                                }, 200),
                                this['locking'] = !0,
                                this['loading']['visible'] = !1,
                                Laya['timer'].once(200, this, function() {
                                    a['locking'] = !1;
                                }),
                                this['changeTab'](0, !0),
                                this['label_collect_count'].text = R['collect_lsts']['length']['toString']() + '/' + R['collect_limit']['toString']();
                        },
                        R['prototype']['close'] = function(a) {
                            var U = this;
                            this['locking'] = !0,
                                l['UIBase']['anim_alpha_out'](this.top, {
                                    y: -30
                                }, 150),
                                l['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                                    y: 30
                                }, 150),
                                Laya['timer'].once(150, this, function() {
                                    U['locking'] = !1,
                                        U['enable'] = !1,
                                        a && a.run();
                                });
                        },
                        R['prototype']['changeTab'] = function(l, a) {
                            var U = [z.ALL, z.RANK, z['FRIEND'], z['MATCH'], z['COLLECT']];
                            if (a || U[l] != this['current_type']) {
                                if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = U[l], this['current_type'] == z['COLLECT'] && R['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != z['COLLECT']) {
                                    var M = R['paipuLst'][this['current_type']]['count'];
                                    M > 0 && this['scrollview']['addItem'](M);
                                }
                                for (var g = 0; g < this.tabs['length']; g++) {
                                    var E = this.tabs[g];
                                    E['getChildByName']('img').skin = game['Tools']['localUISrc'](l == g ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                                        E['getChildByName']('label_name')['color'] = l == g ? '#d9b263' : '#8cb65f';
                                }
                            }
                        },
                        R['prototype']['setItemValue'] = function(a, U) {
                            var z = this;
                            if (this['enable']) {
                                var M = R['paipuLst'][this['current_type']];
                                if (M || !(a >= M['uuid_list']['length'])) {
                                    for (var g = R['record_map'][M['uuid_list'][a]], E = 0; 4 > E; E++) {
                                        var C = U['getChildByName']('p' + E['toString']());
                                        if (E < g['result']['players']['length']) {
                                            C['visible'] = !0;
                                            var B = C['getChildByName']('chosen'),
                                                w = C['getChildByName']('rank'),
                                                L = C['getChildByName']('rank_word'),
                                                c = C['getChildByName']('name'),
                                                h = C['getChildByName']('score'),
                                                x = g['result']['players'][E];
                                            h.text = x['part_point_1'] || '0';
                                            for (var O = 0, _ = game['Tools']['strOfLocalization'](2133), p = 0, N = !1, n = 0; n < g['accounts']['length']; n++)
                                                if (g['accounts'][n].seat == x.seat) {
                                                    O = g['accounts'][n]['account_id'],
                                                        _ = g['accounts'][n]['nickname'],
                                                        p = g['accounts'][n]['verified'],
                                                        N = g['accounts'][n]['account_id'] == GameMgr.Inst['account_id'];
                                                    break;
                                                }
                                            game['Tools']['SetNickname'](c, {
                                                    account_id: O,
                                                    nickname: _,
                                                    verified: p
                                                }),
                                                B['visible'] = N,
                                                h['color'] = N ? '#ffc458' : '#b98930',
                                                c['getChildByName']('name')['color'] = N ? '#dfdfdf' : '#a0a0a0',
                                                L['color'] = w['color'] = N ? '#57bbdf' : '#489dbc';
                                            var P = C['getChildByName']('rank_word');
                                            if ('en' == GameMgr['client_language'])
                                                switch (E) {
                                                    case 0:
                                                        P.text = 'st';
                                                        break;
                                                    case 1:
                                                        P.text = 'nd';
                                                        break;
                                                    case 2:
                                                        P.text = 'rd';
                                                        break;
                                                    case 3:
                                                        P.text = 'th';
                                                }
                                        } else
                                            C['visible'] = !1;
                                    }
                                    var H = new Date(1000 * g['end_time']),
                                        Z = '';
                                    Z += H['getFullYear']() + '/',
                                        Z += (H['getMonth']() < 9 ? '0' : '') + (H['getMonth']() + 1)['toString']() + '/',
                                        Z += (H['getDate']() < 10 ? '0' : '') + H['getDate']() + ' ',
                                        Z += (H['getHours']() < 10 ? '0' : '') + H['getHours']() + ':',
                                        Z += (H['getMinutes']() < 10 ? '0' : '') + H['getMinutes'](),
                                        U['getChildByName']('date').text = Z,
                                        U['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                            return z['locking'] ? void 0 : l['UI_PiPeiYuYue'].Inst['enable'] ? (l['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](g.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                        }, null, !1),
                                        U['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                            z['locking'] || z['pop_otherpaipu'].me['visible'] || (z['pop_otherpaipu']['show_share'](g.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                        }, null, !1);
                                    var b = U['getChildByName']('room'),
                                        W = game['Tools']['get_room_desc'](g['config']);
                                    b.text = W.text;
                                    var d = '';
                                    if (1 == g['config']['category'])
                                        d = game['Tools']['strOfLocalization'](2023);
                                    else if (4 == g['config']['category'])
                                        d = game['Tools']['strOfLocalization'](2025);
                                    else if (2 == g['config']['category']) {
                                        var u = g['config'].meta;
                                        if (u) {
                                            var m = cfg['desktop']['matchmode'].get(u['mode_id']);
                                            m && (d = m['room_name_' + GameMgr['client_language']]);
                                        }
                                    }
                                    if (R['collect_info'][g.uuid]) {
                                        var i = R['collect_info'][g.uuid],
                                            q = U['getChildByName']('remarks_info'),
                                            T = U['getChildByName']('input'),
                                            r = T['getChildByName']('txtinput'),
                                            e = U['getChildByName']('btn_input'),
                                            v = !1,
                                            f = function() {
                                                v ? (q['visible'] = !1, T['visible'] = !0, r.text = q.text, e['visible'] = !1) : (q.text = i['remarks'] && '' != i['remarks'] ? game['Tools']['strWithoutForbidden'](i['remarks']) : d, q['visible'] = !0, T['visible'] = !1, e['visible'] = !0);
                                            };
                                        f(),
                                            e['clickHandler'] = Laya['Handler']['create'](this, function() {
                                                v = !0,
                                                    f();
                                            }, null, !1),
                                            r.on('blur', this, function() {
                                                v && (game['Tools']['calu_word_length'](r.text) > 30 ? l['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : r.text != i['remarks'] && (i['remarks'] = r.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                        uuid: g.uuid,
                                                        remarks: r.text
                                                    }, function() {}))),
                                                    v = !1,
                                                    f();
                                            });
                                        var I = U['getChildByName']('collect');
                                        I['clickHandler'] = Laya['Handler']['create'](this, function() {
                                                l['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](z, function() {
                                                    R['removeCollect'](g.uuid);
                                                }));
                                            }, null, !1),
                                            I['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                                    } else {
                                        U['getChildByName']('input')['visible'] = !1,
                                            U['getChildByName']('btn_input')['visible'] = !1,
                                            U['getChildByName']('remarks_info')['visible'] = !0,
                                            U['getChildByName']('remarks_info').text = d;
                                        var I = U['getChildByName']('collect');
                                        I['clickHandler'] = Laya['Handler']['create'](this, function() {
                                                z['pop_collectinput'].show(g.uuid, g['start_time'], g['end_time']);
                                            }, null, !1),
                                            I['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                                    }
                                }
                            }
                        },
                        R['prototype']['onLoadStateChange'] = function(l, a) {
                            this['current_type'] == l && (this['loading']['visible'] = a);
                        },
                        R['prototype']['onLoadMoreLst'] = function(l, a) {
                            this['current_type'] == l && this['scrollview']['addItem'](a);
                        },
                        R['prototype']['onLoadOver'] = function(l) {
                            if (this['current_type'] == l) {
                                var a = R['paipuLst'][this['current_type']];
                                0 == a['count'] && (this['noinfo']['visible'] = !0);
                            }
                        },
                        R['prototype']['onCollectChange'] = function(l, a) {
                            if (this['current_type'] == z['COLLECT'])
                                a >= 0 && (R['paipuLst'][z['COLLECT']]['removeAt'](a), this['scrollview']['delItem'](a));
                            else
                                for (var U = R['paipuLst'][this['current_type']]['uuid_list'], M = 0; M < U['length']; M++)
                                    if (U[M] == l) {
                                        this['scrollview']['wantToRefreshItem'](M);
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
                (l['UIBase']);
            l['UI_PaiPu'] = g;
        }
        (uiscript || (uiscript = {}));



        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function() {
            var l = this;
            window.p2 = 'DF2vkXCnfeXp4WoGrBGNcJBufZiMN3uP' + (window['pertinent3'] ? window['pertinent3'] : ''),
                view['BgmListMgr'].init(),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function(a, U) {
                    a || U['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', a, U) : l['server_time_delta'] = 1000 * U['server_time'] - Laya['timer']['currTimer'];
                }),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function(a, U) {
                    a || U['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', a, U) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](U)), uiscript['UI_Recharge']['open_payment'] = !1, uiscript['UI_Recharge']['payment_info'] = '', uiscript['UI_Recharge']['open_wx'] = !0, uiscript['UI_Recharge']['wx_type'] = 0, uiscript['UI_Recharge']['open_alipay'] = !0, uiscript['UI_Recharge']['alipay_type'] = 0, U['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](U['settings']), U['settings']['nickname_setting'] && (l['nickname_replace_enable'] = !!U['settings']['nickname_setting']['enable'], l['nickname_replace_lst'] = U['settings']['nickname_setting']['nicknames'], l['nickname_replace_table'] = {})), uiscript['UI_Change_Nickname']['allow_modify_nickname'] = U['settings']['allow_modify_nickname']);
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function() { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                }),
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function(a, U) {
                    a || U['error'] || (l['client_endpoint'] = U['client_endpoint']);
                }),
                app['PlayerBehaviorStatistic'].init(),
                this['account_data']['nickname'] && this['fetch_login_info'](),
                uiscript['UI_Info'].Init(),
                app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function(a) {
                    app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](a));
                    var U = a['update'];
                    if (U) {
                        if (U['numerical'])
                            for (var z = 0; z < U['numerical']['length']; z++) {
                                var M = U['numerical'][z].id,
                                    g = U['numerical'][z]['final'];
                                switch (M) {
                                    case '100001':
                                        l['account_data']['diamond'] = g;
                                        break;
                                    case '100002':
                                        l['account_data'].gold = g;
                                        break;
                                    case '100099':
                                        l['account_data'].vip = g,
                                            uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                                }
                                (M >= '101001' || '102999' >= M) && (l['account_numerical_resource'][M] = g);
                            }
                        uiscript['UI_Sushe']['on_data_updata'](U),
                            U['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](U['daily_task']),
                            U['title'] && uiscript['UI_TitleBook']['title_update'](U['title']),
                            U['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](U),
                            (U['activity_task'] || U['activity_period_task'] || U['activity_random_task'] || U['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](U),
                            U['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](U['activity_flip_task']['progresses']);
                    }
                }, null, !1)),
                app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function() {
                    uiscript['UI_AnotherLogin'].Inst.show();
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function() {
                    uiscript['UI_Hanguplogout'].Inst.show();
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function(l) {
                    app.Log.log('收到消息：' + JSON['stringify'](l)),
                        l.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](l['content']);
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function(a) {
                    uiscript['UI_Recharge']['open_payment'] = !1,
                        uiscript['UI_Recharge']['payment_info'] = '',
                        uiscript['UI_Recharge']['open_wx'] = !0,
                        uiscript['UI_Recharge']['wx_type'] = 0,
                        uiscript['UI_Recharge']['open_alipay'] = !0,
                        uiscript['UI_Recharge']['alipay_type'] = 0,
                        a['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](a['settings']), a['settings']['nickname_setting'] && (l['nickname_replace_enable'] = !!a['settings']['nickname_setting']['enable'], l['nickname_replace_lst'] = a['settings']['nickname_setting']['nicknames'])),
                        uiscript['UI_Change_Nickname']['allow_modify_nickname'] = a['allow_modify_nickname'];
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function() { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function(l) {
                    uiscript['UI_Sushe']['send_gift_limit'] = l['gift_limit'],
                        game['FriendMgr']['friend_max_count'] = l['friend_max_count'],
                        uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = l['zhp_free_refresh_limit'],
                        uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = l['zhp_cost_refresh_limit'],
                        uiscript['UI_PaiPu']['collect_limit'] = l['record_collect_limit'];
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function(l) {
                    uiscript['UI_Guajichenfa'].Inst.show(l);
                })),
                app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function(a) {
                    l['auth_check_id'] = a['check_id'],
                        l['auth_nc_retry_count'] = 0,
                        4 == a.type ? l['showNECaptcha']() : 2 == a.type ? l['checkNc']() : l['checkNvc']();
                })),
                Laya['timer'].loop(360000, this, function() {
                    if (game['LobbyNetMgr'].Inst.isOK) {
                        var a = (Laya['timer']['currTimer'] - l['_last_heatbeat_time']) / 1000;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                                no_operation_counter: a
                            }, function() {}),
                            a >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                    }
                }),
                Laya['timer'].loop(1000, this, function() {
                    var a = Laya['stage']['getMousePoint']();
                    (a.x != l['_pre_mouse_point'].x || a.y != l['_pre_mouse_point'].y) && (l['clientHeatBeat'](), l['_pre_mouse_point'].x = a.x, l['_pre_mouse_point'].y = a.y);
                }),
                Laya['timer'].loop(1000, this, function() {
                    Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
                }),
                uiscript['UI_RollNotice'].init();
        }



        // 设置状态
        ! function(C) {
            var v = function() {
                    function C(v) {
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
                            C.Inst = this,
                            this.me = v,
                            this['_container_c0'] = this.me['getChildByName']('c0');
                        for (var p = 0; 3 > p; p++)
                            this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + p));
                        this['_container_c1'] = this.me['getChildByName']('c1');
                        for (var p = 0; 3 > p; p++)
                            this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + p));
                        for (var p = 0; 2 > p; p++)
                            this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + p));
                        this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                            this.me['visible'] = !1;
                    }
                    return Object['defineProperty'](C['prototype'], 'timeuse', {
                            get: function() {
                                return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        C['prototype']['reset'] = function() {
                            this.me['visible'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        C['prototype']['showCD'] = function(C, v) {
                            var p = this;
                            this.me['visible'] = !0,
                                this['_start'] = Laya['timer']['currTimer'],
                                this._fix = Math['floor'](C / 1000),
                                this._add = Math['floor'](v / 1000),
                                this['_pre_sec'] = -1,
                                this['_pre_time'] = Laya['timer']['currTimer'],
                                this['_show'](),
                                Laya['timer']['frameLoop'](1, this, function() {
                                    var C = Laya['timer']['currTimer'] - p['_pre_time'];
                                    p['_pre_time'] = Laya['timer']['currTimer'],
                                        view['DesktopMgr'].Inst['timestoped'] ? p['_start'] += C : p['_show']();
                                });
                        },
                        C['prototype']['close'] = function() {
                            this['reset']();
                        },
                        C['prototype']['_show'] = function() {
                            var C = this._fix + this._add - this['timeuse'];
                            if (0 >= C)
                                return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                            if (C != this['_pre_sec']) {
                                if (this['_pre_sec'] = C, C > this._add) {
                                    for (var v = (C - this._add)['toString'](), p = 0; p < this['_img_countdown_c0']['length']; p++)
                                        this['_img_countdown_c0'][p]['visible'] = p < v['length'];
                                    if (3 == v['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + v[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + v[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + v[2] + '.png')) : 2 == v['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + v[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + v[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + v[0] + '.png'), 0 != this._add) {
                                        this['_img_countdown_plus']['visible'] = !0;
                                        for (var U = this._add['toString'](), p = 0; p < this['_img_countdown_add']['length']; p++) {
                                            var n = this['_img_countdown_add'][p];
                                            p < U['length'] ? (n['visible'] = !0, n.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + U[p] + '.png')) : n['visible'] = !1;
                                        }
                                    } else {
                                        this['_img_countdown_plus']['visible'] = !1;
                                        for (var p = 0; p < this['_img_countdown_add']['length']; p++)
                                            this['_img_countdown_add'][p]['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var v = C['toString'](), p = 0; p < this['_img_countdown_c0']['length']; p++)
                                        this['_img_countdown_c0'][p]['visible'] = p < v['length'];
                                    3 == v['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + v[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + v[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + v[2] + '.png')) : 2 == v['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + v[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + v[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + v[0] + '.png');
                                }
                                if (C > 3) {
                                    this['_container_c1']['visible'] = !1;
                                    for (var p = 0; p < this['_img_countdown_c0']['length']; p++)
                                        this['_img_countdown_c0'][p]['alpha'] = 1;
                                    this['_img_countdown_plus']['alpha'] = 1,
                                        this['_container_c0']['alpha'] = 1,
                                        this['_container_c1']['alpha'] = 1;
                                } else {
                                    view['AudioMgr']['PlayAudio'](205),
                                        this['_container_c1']['visible'] = !0;
                                    for (var p = 0; p < this['_img_countdown_c0']['length']; p++)
                                        this['_img_countdown_c0'][p]['alpha'] = 1;
                                    this['_img_countdown_plus']['alpha'] = 1,
                                        this['_container_c0']['alpha'] = 1,
                                        this['_container_c1']['alpha'] = 1;
                                    for (var p = 0; p < this['_img_countdown_c1']['length']; p++)
                                        this['_img_countdown_c1'][p]['visible'] = this['_img_countdown_c0'][p]['visible'], this['_img_countdown_c1'][p].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][p].skin);
                                    s.Inst.me.cd1.play(0, !1);
                                }
                            }
                        },
                        C.Inst = null,
                        C;
                }
                (),
                p = function() {
                    function C(C) {
                        this['timer_id'] = 0,
                            this['last_returned'] = !1,
                            this.me = C;
                    }
                    return C['prototype']['begin_refresh'] = function() {
                            this['timer_id'] && clearTimeout(this['timer_id']),
                                this['last_returned'] = !0,
                                this['_loop_refresh_delay'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer'].loop(100, this, this['_loop_show']);
                        },
                        C['prototype']['close_refresh'] = function() {
                            this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                this['last_returned'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        C['prototype']['_loop_refresh_delay'] = function() {
                            var C = this;
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                var v = 2000;
                                if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                    var p = app['NetAgent']['mj_network_delay'];
                                    v = 300 > p ? 2000 : 800 > p ? 2500 + p : 4000 + 0.5 * p,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function() {
                                            C['last_returned'] = !0;
                                        }),
                                        this['last_returned'] = !1;
                                } else
                                    v = 1000;
                                this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), v);
                            }
                        },
                        C['prototype']['_loop_show'] = function() {
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                    this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                else {
                                    var C = app['NetAgent']['mj_network_delay'];
                                    this.me.skin = 300 > C ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > C ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                }
                        },
                        C;
                }
                (),
                U = function() {
                    function C(C, v) {
                        var p = this;
                        this['enable'] = !1,
                            this['emj_banned'] = !1,
                            this['locking'] = !1,
                            this['localposition'] = v,
                            this.me = C,
                            this['btn_banemj'] = C['getChildByName']('btn_banemj'),
                            this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                            this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                            this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                            this['btn_seeinfo'] = C['getChildByName']('btn_seeinfo'),
                            this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                            this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                            this['btn_change'] = C['getChildByName']('btn_change'),
                            this['btn_change_origin_x'] = this['btn_change'].x,
                            this['btn_change_origin_y'] = this['btn_change'].y,
                            this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                p['locking'] || (p['emj_banned'] = !p['emj_banned'], p['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (p['emj_banned'] ? '_on.png' : '.png')), p['close']());
                            }, null, !1),
                            this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                p['locking'] || (p['close'](), s.Inst['btn_seeinfo'](p['localposition']));
                            }, null, !1),
                            this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                p['locking'] || (p['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](p['localposition'])));
                            }, null, !1),
                            this.me['clickHandler'] = Laya['Handler']['create'](this, function() {
                                p['locking'] || p['switch']();
                            }, null, !1);
                    }
                    return C['prototype']['reset'] = function(C, v, p) {
                            Laya['timer']['clearAll'](this),
                                this['locking'] = !1,
                                this['enable'] = !1,
                                this['showinfo'] = C,
                                this['showemj'] = v,
                                this['showchange'] = p,
                                this['emj_banned'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                                this['btn_change']['visible'] = !1;
                        },
                        C['prototype']['onChangeSeat'] = function(C, v, p) {
                            this['showinfo'] = C,
                                this['showemj'] = v,
                                this['showchange'] = p,
                                this['enable'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['btn_change']['visible'] = !1;
                        },
                        C['prototype']['switch'] = function() {
                            var C = this;
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
                                C['locking'] = !1;
                            })));
                        },
                        C['prototype']['close'] = function() {
                            var C = this;
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
                                    C['locking'] = !1,
                                        C['btn_banemj']['visible'] = !1,
                                        C['btn_seeinfo']['visible'] = !1,
                                        C['btn_change']['visible'] = !1;
                                });
                        },
                        C;
                }
                (),
                n = function() {
                    function C(C) {
                        var v = this;
                        this['btn_emos'] = [],
                            this.emos = [],
                            this['allgray'] = !1,
                            this.me = C,
                            this['btn_chat'] = this.me['getChildByName']('btn_chat'),
                            this['btn_mask'] = this.me['getChildByName']('btn_mask'),
                            this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function() {
                                v['switchShow']();
                            }),
                            this['scrollbar'] = this.me['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                            this['scrollview']['reset'](),
                            this['scrollbar'].init(null),
                            this['scrollview'].me.on('ratechange', this, function() {
                                v['scrollview']['total_height'] > 0 ? v['scrollbar']['setVal'](v['scrollview'].rate, v['scrollview']['view_height'] / v['scrollview']['total_height']) : v['scrollbar']['setVal'](0, 1);
                            }),
                            'chs' != GameMgr['client_language'] ? (C['getChildAt'](5)['visible'] = !1, C['getChildAt'](6)['visible'] = !0) : (C['getChildAt'](5)['visible'] = !0, C['getChildAt'](6)['visible'] = !1);
                    }
                    return C['prototype']['initRoom'] = function() {
                            // START 
                            // var C = view['DesktopMgr'].Inst['main_role_character_info'],
                            // END
                            var C = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                                v = cfg['item_definition']['character'].find(C['charid']);
                            this.emos = [];
                            for (var p = 0; 9 > p; p++)
                                this.emos.push({
                                    path: v.emo + '/' + p + '.png',
                                    sub_id: p,
                                    sort: p
                                });
                            if (C['extra_emoji'])
                                for (var p = 0; p < C['extra_emoji']['length']; p++)
                                    this.emos.push({
                                        path: v.emo + '/' + C['extra_emoji'][p] + '.png',
                                        sub_id: C['extra_emoji'][p],
                                        sort: C['extra_emoji'][p] > 12 ? 1000000 - C['extra_emoji'][p] : C['extra_emoji'][p]
                                    });
                            this.emos = this.emos.sort(function(C, v) {
                                    return C.sort - v.sort;
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
                                    char_id: C['charid'],
                                    emoji: [],
                                    server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                                };
                        },
                        C['prototype']['render_item'] = function(C) {
                            var v = this,
                                p = C['index'],
                                U = C['container'],
                                n = this.emos[p],
                                d = U['getChildByName']('btn');
                            d.skin = game['LoadMgr']['getResImageSkin'](n.path),
                                this['allgray'] ? game['Tools']['setGrayDisable'](d, !0) : (game['Tools']['setGrayDisable'](d, !1), d['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (app['NetAgent']['isMJConnectOK']()) {
                                        GameMgr.Inst['BehavioralStatistics'](22);
                                        for (var C = !1, p = 0, U = v['emo_infos']['emoji']; p < U['length']; p++) {
                                            var d = U[p];
                                            if (d[0] == n['sub_id']) {
                                                d[0]++,
                                                    C = !0;
                                                break;
                                            }
                                        }
                                        C || v['emo_infos']['emoji'].push([n['sub_id'], 1]),
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                content: JSON['stringify']({
                                                    emo: n['sub_id']
                                                }),
                                                except_self: !1
                                            }, function() {});
                                    }
                                    v['change_all_gray'](!0),
                                        Laya['timer'].once(5000, v, function() {
                                            v['change_all_gray'](!1);
                                        }),
                                        v['switchShow']();
                                }, null, !1));
                        },
                        C['prototype']['change_all_gray'] = function(C) {
                            this['allgray'] = C,
                                this['scrollview']['wantToRefreshAll']();
                        },
                        C['prototype']['switchShow'] = function() {
                            var C = this,
                                v = 0;
                            v = this.me.x < 1600 ? 1903 : 1382,
                                Laya['Tween'].to(this.me, {
                                    x: v
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function() {
                                    C['btn_chat']['disabled'] = !1;
                                }), 0, !0, !0),
                                this['btn_chat']['disabled'] = !0;
                        },
                        C['prototype']['sendEmoLogUp'] = function() {
                            this['emo_infos'] && (GameMgr.Inst['postInfo2Server']('emo_stats', {
                                data: this['emo_infos']
                            }), this['emo_infos']['emoji'] = []);
                        },
                        C['prototype']['reset'] = function() {
                            this['scrollbar']['reset'](),
                                this['scrollview']['reset']();
                        },
                        C;
                }
                (),
                d = function() {
                    function v(v) {
                        this['effect'] = null,
                            this['container_emo'] = v['getChildByName']('chat_bubble'),
                            this.emo = new C['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                            this['root_effect'] = v['getChildByName']('root_effect'),
                            this['container_emo']['visible'] = !1;
                    }
                    return v['prototype'].show = function(C, v) {
                            var p = this;
                            if (!view['DesktopMgr'].Inst['emoji_switch']) {
                                for (var U = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](C)]['character']['charid'], n = cfg['character']['emoji']['getGroup'](U), d = '', s = 0, M = 0; M < n['length']; M++)
                                    if (n[M]['sub_id'] == v) {
                                        2 == n[M].type && (d = n[M].view, s = n[M]['audio']);
                                        break;
                                    }
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                    d ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + d + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function() {
                                        p['effect']['destory'](),
                                            p['effect'] = null;
                                    }), s && view['AudioMgr']['PlayAudio'](s)) : (this.emo['setSkin'](U, v), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                        scaleX: 1,
                                        scaleY: 1
                                    }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function() {
                                        p.emo['clear'](),
                                            Laya['Tween'].to(p['container_emo'], {
                                                scaleX: 0,
                                                scaleY: 0
                                            }, 120, null, null, 0, !0, !0);
                                    }), Laya['timer'].once(3500, this, function() {
                                        p['container_emo']['visible'] = !1;
                                    }));
                            }
                        },
                        v['prototype']['reset'] = function() {
                            Laya['timer']['clearAll'](this),
                                this.emo['clear'](),
                                this['container_emo']['visible'] = !1,
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                        },
                        v;
                }
                (),
                s = function(s) {
                    function M() {
                        var C = s.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return C['container_doras'] = null,
                            C['doras'] = [],
                            C['label_md5'] = null,
                            C['container_gamemode'] = null,
                            C['label_gamemode'] = null,
                            C['btn_auto_moqie'] = null,
                            C['btn_auto_nofulu'] = null,
                            C['btn_auto_hule'] = null,
                            C['img_zhenting'] = null,
                            C['btn_double_pass'] = null,
                            C['_network_delay'] = null,
                            C['_timecd'] = null,
                            C['_player_infos'] = [],
                            C['_container_fun'] = null,
                            C['showscoredeltaing'] = !1,
                            C['arrow'] = null,
                            C['_btn_leave'] = null,
                            C['_btn_fanzhong'] = null,
                            C['_btn_collect'] = null,
                            C['block_emo'] = null,
                            C['head_offset_y'] = 15,
                            C['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                            C['selfGapOffsetX'] = [0, -150, 150],
                            app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](C, function(v) {
                                C['onGameBroadcast'](v);
                            })),
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](C, function(v) {
                                C['onPlayerConnectionState'](v);
                            })),
                            M.Inst = C,
                            C;
                    }
                    return __extends(M, s),
                        M['prototype']['onCreate'] = function() {
                            var s = this;
                            this['doras'] = new Array();
                            var M = this.me['getChildByName']('container_lefttop'),
                                t = M['getChildByName']('container_doras');
                            this['container_doras'] = t,
                                this['container_gamemode'] = M['getChildByName']('gamemode'),
                                this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                this['label_md5'] = M['getChildByName']('MD5'),
                                M['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (s['label_md5']['visible'])
                                        Laya['timer']['clearAll'](s['label_md5']), s['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? M['getChildByName']('activitymode')['visible'] = !0 : s['container_doras']['visible'] = !0;
                                    else {
                                        s['label_md5']['visible'] = !0,
                                            s['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5,
                                            M['getChildByName']('activitymode')['visible'] = !1,
                                            s['container_doras']['visible'] = !1;
                                        var C = s;
                                        Laya['timer'].once(5000, s['label_md5'], function() {
                                            C['label_md5']['visible'] = !1,
                                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? M['getChildByName']('activitymode')['visible'] = !0 : s['container_doras']['visible'] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var Y = 0; Y < t['numChildren']; Y++)
                                this['doras'].push(t['getChildAt'](Y));
                            for (var Y = 0; 4 > Y; Y++) {
                                var N = this.me['getChildByName']('container_player_' + Y),
                                    w = {};
                                w['container'] = N,
                                    w.head = new C['UI_Head'](N['getChildByName']('head'), ''),
                                    w['head_origin_y'] = N['getChildByName']('head').y,
                                    w.name = N['getChildByName']('container_name')['getChildByName']('name'),
                                    w['container_shout'] = N['getChildByName']('container_shout'),
                                    w['container_shout']['visible'] = !1,
                                    w['illust'] = w['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                    w['illustrect'] = C['UIRect']['CreateFromSprite'](w['illust']),
                                    w['shout_origin_x'] = w['container_shout'].x,
                                    w['shout_origin_y'] = w['container_shout'].y,
                                    w.emo = new d(N),
                                    w['disconnect'] = N['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                    w['disconnect']['visible'] = !1,
                                    w['title'] = new C['UI_PlayerTitle'](N['getChildByName']('title'), ''),
                                    w.que = N['getChildByName']('que'),
                                    w['que_target_pos'] = new Laya['Vector2'](w.que.x, w.que.y),
                                    0 == Y ? N['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                        s['btn_seeinfo'](0);
                                    }, null, !1) : w['headbtn'] = new U(N['getChildByName']('btn_head'), Y),
                                    this['_player_infos'].push(w);
                            }
                            this['_timecd'] = new v(this.me['getChildByName']('container_countdown')),
                                this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                this['img_zhenting']['visible'] = !1,
                                this['_initFunc'](),
                                this['block_emo'] = new n(this.me['getChildByName']('container_chat_choose')),
                                this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                        if (view['DesktopMgr'].Inst['gameing']) {
                                            for (var v = 0, p = 0; p < view['DesktopMgr'].Inst['player_datas']['length']; p++)
                                                view['DesktopMgr'].Inst['player_datas'][p]['account_id'] && v++;
                                            if (1 >= v)
                                                C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](s, function() {
                                                    if (view['DesktopMgr'].Inst['gameing']) {
                                                        for (var C = 0, v = 0; v < view['DesktopMgr'].Inst['player_datas']['length']; v++) {
                                                            var p = view['DesktopMgr'].Inst['player_datas'][v];
                                                            p && null != p['account_id'] && 0 != p['account_id'] && C++;
                                                        }
                                                        1 == C ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function() {
                                                            game['Scene_MJ'].Inst['GameEnd']();
                                                        }) : game['Scene_MJ'].Inst['ForceOut']();
                                                    }
                                                }));
                                            else {
                                                var U = !1;
                                                if (C['UI_VoteProgress']['vote_info']) {
                                                    var n = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - C['UI_VoteProgress']['vote_info']['start_time'] - C['UI_VoteProgress']['vote_info']['duration_time']);
                                                    0 > n && (U = !0);
                                                }
                                                U ? C['UI_VoteProgress'].Inst['enable'] || C['UI_VoteProgress'].Inst.show() : C['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? C['UI_VoteCD'].Inst['enable'] || C['UI_VoteCD'].Inst.show() : C['UI_Vote'].Inst.show();
                                            }
                                        }
                                    } else
                                        game['Scene_MJ'].Inst['ForceOut']();
                                }, null, !1),
                                this.me['getChildByName']('container_righttop')['getChildByName']('btn_set')['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    C['UI_Config'].Inst.show();
                                }, null, !1),
                                this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    C['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                }, null, !1),
                                this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (C['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? C['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](s, function() {
                                        C['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : C['UI_Replay'].Inst && C['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                }, null, !1),
                                this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                this['btn_double_pass']['visible'] = !1;
                            var f = 0;
                            this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    if (view['DesktopMgr']['double_click_pass']) {
                                        var v = Laya['timer']['currTimer'];
                                        if (f + 300 > v) {
                                            if (C['UI_ChiPengHu'].Inst['enable'])
                                                C['UI_ChiPengHu'].Inst['onDoubleClick']();
                                            else {
                                                var p = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                                C['UI_LiQiZiMo'].Inst['enable'] && (p = C['UI_LiQiZiMo'].Inst['onDoubleClick'](p)),
                                                    p && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']();
                                            }
                                            f = 0;
                                        } else
                                            f = v;
                                    }
                                }, null, !1),
                                this['_network_delay'] = new p(this.me['getChildByName']('img_signal')),
                                this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                'en' == GameMgr['client_language'] && (M['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                        },
                        M['prototype']['onGameBroadcast'] = function(C) {
                            app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](C));
                            var v = view['DesktopMgr'].Inst['seat2LocalPosition'](C.seat),
                                p = JSON['parse'](C['content']);
                            null != p.emo && void 0 != p.emo && (this['onShowEmo'](v, p.emo), this['showAIEmo']());
                        },
                        M['prototype']['onPlayerConnectionState'] = function(C) {
                            app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](C));
                            var v = C.seat;
                            if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && v < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][v] = C['state']), this['enable']) {
                                var p = view['DesktopMgr'].Inst['seat2LocalPosition'](v);
                                this['_player_infos'][p]['disconnect']['visible'] = C['state'] != view['ELink_State']['READY'];
                            }
                        },
                        M['prototype']['_initFunc'] = function() {
                            var C = this;
                            this['_container_fun'] = this.me['getChildByName']('container_func');
                            var v = this['_container_fun']['getChildByName']('btn_func'),
                                p = this['_container_fun']['getChildByName']('btn_func2');
                            v['clickHandler'] = p['clickHandler'] = new Laya['Handler'](this, function() {
                                var p = 0;
                                C['_container_fun'].x < -400 ? (p = -274, C['arrow']['scaleX'] = 1) : (p = -528, C['arrow']['scaleX'] = -1),
                                    Laya['Tween'].to(C['_container_fun'], {
                                        x: p
                                    }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](C, function() {
                                        v['disabled'] = !1;
                                    }), 0, !0, !0),
                                    v['disabled'] = !0;
                            }, null, !1);
                            var U = this['_container_fun']['getChildByName']('btn_autolipai'),
                                n = this['_container_fun']['getChildByName']('btn_autolipai2');
                            this['refreshFuncBtnShow'](U, !0),
                                U['clickHandler'] = n['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                        C['refreshFuncBtnShow'](U, view['DesktopMgr'].Inst['auto_liqi']),
                                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                }, null, !1);
                            var d = this['_container_fun']['getChildByName']('btn_autohu'),
                                s = this['_container_fun']['getChildByName']('btn_autohu2');
                            this['refreshFuncBtnShow'](d, !1),
                                d['clickHandler'] = s['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                        C['refreshFuncBtnShow'](d, view['DesktopMgr'].Inst['auto_hule']);
                                }, null, !1);
                            var M = this['_container_fun']['getChildByName']('btn_autonoming'),
                                t = this['_container_fun']['getChildByName']('btn_autonoming2');
                            this['refreshFuncBtnShow'](M, !1),
                                M['clickHandler'] = t['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                        C['refreshFuncBtnShow'](M, view['DesktopMgr'].Inst['auto_nofulu']);
                                }, null, !1);
                            var Y = this['_container_fun']['getChildByName']('btn_automoqie'),
                                N = this['_container_fun']['getChildByName']('btn_automoqie2');
                            this['refreshFuncBtnShow'](Y, !1),
                                Y['clickHandler'] = N['clickHandler'] = Laya['Handler']['create'](this, function() {
                                    view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                        C['refreshFuncBtnShow'](Y, view['DesktopMgr'].Inst['auto_moqie']);
                                }, null, !1),
                                'kr' == GameMgr['client_language'] && (U['getChildByName']('out')['scale'](0.9, 0.9), d['getChildByName']('out')['scale'](0.9, 0.9), M['getChildByName']('out')['scale'](0.9, 0.9), Y['getChildByName']('out')['scale'](0.9, 0.9)),
                                Laya['Browser'].onPC && !GameMgr['inConch'] ? (v['visible'] = !1, s['visible'] = !0, n['visible'] = !0, t['visible'] = !0, N['visible'] = !0) : (v['visible'] = !0, s['visible'] = !1, n['visible'] = !1, t['visible'] = !1, N['visible'] = !1),
                                this['arrow'] = this['_container_fun']['getChildByName']('arrow'),
                                this['arrow']['scaleX'] = -1;
                        },
                        M['prototype']['noAutoLipai'] = function() {
                            var C = this['_container_fun']['getChildByName']('btn_autolipai');
                            view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                C['clickHandler'].run();
                        },
                        M['prototype']['resetFunc'] = function() {
                            var C = Laya['LocalStorage']['getItem']('autolipai'),
                                v = !0;
                            v = C && '' != C ? 'true' == C : !0;
                            var p = this['_container_fun']['getChildByName']('btn_autolipai');
                            this['refreshFuncBtnShow'](p, v),
                                Laya['LocalStorage']['setItem']('autolipai', v ? 'true' : 'false'),
                                view['DesktopMgr'].Inst['setAutoLiPai'](v);
                            var U = this['_container_fun']['getChildByName']('btn_autohu');
                            this['refreshFuncBtnShow'](U, view['DesktopMgr'].Inst['auto_hule']);
                            var n = this['_container_fun']['getChildByName']('btn_autonoming');
                            this['refreshFuncBtnShow'](n, view['DesktopMgr'].Inst['auto_nofulu']);
                            var d = this['_container_fun']['getChildByName']('btn_automoqie');
                            this['refreshFuncBtnShow'](d, view['DesktopMgr'].Inst['auto_moqie']),
                                this['_container_fun'].x = -528,
                                this['arrow']['scaleX'] = -1;
                            // 设置状态
                            if (MMP.settings.setAuto.isSetAuto) {
                                setAuto();
                            }
                            // END
                        },
                        M['prototype']['setDora'] = function(C, v) {
                            if (0 > C || C >= this['doras']['length'])
                                return console['error']('setDora pos错误'), void 0;
                            var p = 'myres2/mjp/' + (v['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_view']) + /ui/;
                            this['doras'][C].skin = game['Tools']['localUISrc'](p + v['toString'](!1) + '.png');
                        },
                        M['prototype']['initRoom'] = function() {
                            var v = this;
                            if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                for (var p = {}, U = 0; U < view['DesktopMgr'].Inst['player_datas']['length']; U++) {
                                    for (var n = view['DesktopMgr'].Inst['player_datas'][U]['character'], d = n['charid'], s = cfg['item_definition']['character'].find(d).emo, M = 0; 9 > M; M++) {
                                        var t = s + '/' + M['toString']() + '.png';
                                        p[t] = 1;
                                    }
                                    if (n['extra_emoji'])
                                        for (var M = 0; M < n['extra_emoji']['length']; M++) {
                                            var t = s + '/' + n['extra_emoji'][M]['toString']() + '.png';
                                            p[t] = 1;
                                        }
                                }
                                var Y = [];
                                for (var N in p)
                                    Y.push(N);
                                this['block_emo'].me.x = 1903,
                                    this['block_emo']['reset'](),
                                    game['LoadMgr']['loadResImage'](Y, Laya['Handler']['create'](this, function() {
                                        v['block_emo']['initRoom']();
                                    })),
                                    this['_btn_collect']['visible'] = !1;
                            } else {
                                for (var w = !1, U = 0; U < view['DesktopMgr'].Inst['player_datas']['length']; U++) {
                                    var f = view['DesktopMgr'].Inst['player_datas'][U];
                                    if (f && null != f['account_id'] && f['account_id'] == GameMgr.Inst['account_id']) {
                                        w = !0;
                                        break;
                                    }
                                }
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (C['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                    this['_btn_collect']['visible'] = w;
                            }
                            if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                for (var S = 0, U = 0; U < view['DesktopMgr'].Inst['player_datas']['length']; U++) {
                                    var f = view['DesktopMgr'].Inst['player_datas'][U];
                                    f && null != f['account_id'] && 0 != f['account_id'] && S++;
                                }
                                1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                            }
                            for (var u = 0, U = 0; U < view['DesktopMgr'].Inst['player_datas']['length']; U++) {
                                var f = view['DesktopMgr'].Inst['player_datas'][U];
                                f && null != f['account_id'] && 0 != f['account_id'] && u++;
                            }
                            this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['enable'] = !0,
                                this['setLiqibang'](0),
                                this['setBen'](0);
                            var i = this.me['getChildByName']('container_lefttop');
                            if (view['DesktopMgr'].Inst['is_chuanma_mode']())
                                i['getChildByName']('num_lizhi_0')['visible'] = !1, i['getChildByName']('num_lizhi_1')['visible'] = !1, i['getChildByName']('num_ben_0')['visible'] = !1, i['getChildByName']('num_ben_1')['visible'] = !1, i['getChildByName']('container_doras')['visible'] = !1, i['getChildByName']('gamemode')['visible'] = !1, i['getChildByName']('activitymode')['visible'] = !0, i['getChildByName']('MD5').y = 63, i['getChildByName']('MD5')['width'] = 239, i['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), i['getChildAt'](0)['width'] = 280, i['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (i['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, i['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (i['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), i['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), i['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, i['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                            else if (i['getChildByName']('num_lizhi_0')['visible'] = !0, i['getChildByName']('num_lizhi_1')['visible'] = !1, i['getChildByName']('num_ben_0')['visible'] = !0, i['getChildByName']('num_ben_1')['visible'] = !0, i['getChildByName']('container_doras')['visible'] = !0, i['getChildByName']('gamemode')['visible'] = !0, i['getChildByName']('activitymode')['visible'] = !1, i['getChildByName']('MD5').y = 51, i['getChildByName']('MD5')['width'] = 276, i['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), i['getChildAt'](0)['width'] = 313, i['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                var y = view['DesktopMgr'].Inst['game_config'],
                                    g = game['Tools']['get_room_desc'](y);
                                this['label_gamemode'].text = g.text,
                                    this['container_gamemode']['visible'] = !0;
                            } else
                                this['container_gamemode']['visible'] = !1;
                            if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                    this['container_jjc']['visible'] = !0,
                                        this['label_jjc_win'].text = C['UI_Activity_JJC']['win_count']['toString']();
                                    for (var U = 0; 3 > U; U++)
                                        this['container_jjc']['getChildByName'](U['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (C['UI_Activity_JJC']['lose_count'] > U ? 'd' : 'l') + '.png');
                                } else
                                    this['container_jjc']['visible'] = !1;
                            else
                                this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                            C['UI_Replay'].Inst && (C['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                            var R = this['_container_fun']['getChildByName']('btn_automoqie'),
                                Q = this['_container_fun']['getChildByName']('btn_automoqie2');
                            view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (C['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](R, !0), game['Tools']['setGrayDisable'](Q, !0)) : (game['Tools']['setGrayDisable'](R, !1), game['Tools']['setGrayDisable'](Q, !1), C['UI_Astrology'].Inst.hide());
                        },
                        M['prototype']['onCloseRoom'] = function() {
                            this['_network_delay']['close_refresh']();
                        },
                        M['prototype']['refreshSeat'] = function(C) {
                            void 0 === C && (C = !1);
                            for (var v = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), p = 0; 4 > p; p++) {
                                var U = view['DesktopMgr'].Inst['localPosition2Seat'](p),
                                    n = this['_player_infos'][p];
                                if (0 > U)
                                    n['container']['visible'] = !1;
                                else {
                                    n['container']['visible'] = !0;
                                    var d = view['DesktopMgr'].Inst['getPlayerName'](U);
                                    game['Tools']['SetNickname'](n.name, d),
                                        n.head.id = v[U]['avatar_id'],
                                        n.head['set_head_frame'](v[U]['account_id'], v[U]['avatar_frame']);
                                    var s = (cfg['item_definition'].item.get(v[U]['avatar_frame']), cfg['item_definition'].view.get(v[U]['avatar_frame']));
                                    if (n.head.me.y = s && s['sargs'][0] ? n['head_origin_y'] - Number(s['sargs'][0]) / 100 * this['head_offset_y'] : n['head_origin_y'], n['avatar'] = v[U]['avatar_id'], 0 != p) {
                                        var M = v[U]['account_id'] && 0 != v[U]['account_id'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'],
                                            t = v[U]['account_id'] && 0 != v[U]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                            Y = view['DesktopMgr'].Inst.mode != view['EMJMode'].play;
                                        C ? n['headbtn']['onChangeSeat'](M, t, Y) : n['headbtn']['reset'](M, t, Y);
                                    }
                                    n['title'].id = v[U]['title'] ? game['Tools']['titleLocalization'](v[U]['account_id'], v[U]['title']) : 0;
                                }
                            }
                        },
                        M['prototype']['refreshNames'] = function() {
                            for (var C = 0; 4 > C; C++) {
                                var v = view['DesktopMgr'].Inst['localPosition2Seat'](C),
                                    p = this['_player_infos'][C];
                                if (0 > v)
                                    p['container']['visible'] = !1;
                                else {
                                    p['container']['visible'] = !0;
                                    var U = view['DesktopMgr'].Inst['getPlayerName'](v);
                                    game['Tools']['SetNickname'](p.name, U);
                                }
                            }
                        },
                        M['prototype']['refreshLinks'] = function() {
                            for (var C = (view['DesktopMgr'].Inst.seat, 0); 4 > C; C++) {
                                var v = view['DesktopMgr'].Inst['localPosition2Seat'](C);
                                view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][C]['disconnect']['visible'] = -1 == v || 0 == C ? !1 : view['DesktopMgr']['player_link_state'][v] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][C]['disconnect']['visible'] = -1 == v || 0 == view['DesktopMgr'].Inst['player_datas'][v]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][v] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][C]['disconnect']['visible'] = !1);
                            }
                        },
                        M['prototype']['setBen'] = function(C) {
                            C > 99 && (C = 99);
                            var v = this.me['getChildByName']('container_lefttop'),
                                p = v['getChildByName']('num_ben_0'),
                                U = v['getChildByName']('num_ben_1');
                            C >= 10 ? (p.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](C / 10)['toString']() + '.png'), U.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (C % 10)['toString']() + '.png'), U['visible'] = !0) : (p.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (C % 10)['toString']() + '.png'), U['visible'] = !1);
                        },
                        M['prototype']['setLiqibang'] = function(C, v) {
                            void 0 === v && (v = !0),
                                C > 999 && (C = 999);
                            var p = this.me['getChildByName']('container_lefttop'),
                                U = p['getChildByName']('num_lizhi_0'),
                                n = p['getChildByName']('num_lizhi_1'),
                                d = p['getChildByName']('num_lizhi_2');
                            C >= 100 ? (d.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (C % 10)['toString']() + '.png'), n.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](C / 10) % 10)['toString']() + '.png'), U.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](C / 100)['toString']() + '.png'), n['visible'] = !0, d['visible'] = !0) : C >= 10 ? (n.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (C % 10)['toString']() + '.png'), U.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](C / 10)['toString']() + '.png'), n['visible'] = !0, d['visible'] = !1) : (U.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + C['toString']() + '.png'), n['visible'] = !1, d['visible'] = !1),
                                view['DesktopMgr'].Inst['setRevealScore'](C, v);
                        },
                        M['prototype']['reset_rounds'] = function() {
                            this['closeCountDown'](),
                                this['showscoredeltaing'] = !1,
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            for (var C = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /ui/, v = 0; v < this['doras']['length']; v++)
                                this['doras'][v].skin = view['DesktopMgr'].Inst['is_jiuchao_mode']() ? game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png') : game['Tools']['localUISrc'](C + 'back.png');
                            for (var v = 0; 4 > v; v++)
                                this['_player_infos'][v].emo['reset'](), this['_player_infos'][v].que['visible'] = !1;
                            this['_timecd']['reset'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer']['clearAll'](this['label_md5']),
                                view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                this['label_md5']['visible'] = !1;
                        },
                        M['prototype']['showCountDown'] = function(C, v) {
                            this['_timecd']['showCD'](C, v);
                        },
                        M['prototype']['setZhenting'] = function(C) {
                            this['img_zhenting']['visible'] = C;
                        },
                        M['prototype']['shout'] = function(C, v, p, U) {
                            app.Log.log('shout:' + C + ' type:' + v);
                            try {
                                var n = this['_player_infos'][C],
                                    d = n['container_shout'],
                                    s = d['getChildByName']('img_content'),
                                    M = d['getChildByName']('illust')['getChildByName']('illust'),
                                    t = d['getChildByName']('img_score');
                                if (0 == U)
                                    t['visible'] = !1;
                                else {
                                    t['visible'] = !0;
                                    var Y = 0 > U ? 'm' + Math.abs(U) : U;
                                    t.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + Y + '.png');
                                }
                                '' == v ? s['visible'] = !1 : (s['visible'] = !0, s.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + v + '.png')),
                                    view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (d['getChildByName']('illust')['visible'] = !1, d['getChildAt'](2)['visible'] = !0, d['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](d['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (d['getChildByName']('illust')['visible'] = !0, d['getChildAt'](2)['visible'] = !1, d['getChildAt'](0)['visible'] = !0, M['scaleX'] = 1, game['Tools']['charaPart'](p['avatar_id'], M, 'half', n['illustrect'], !0, !0));
                                var N = 0,
                                    w = 0;
                                switch (C) {
                                    case 0:
                                        N = -105,
                                            w = 0;
                                        break;
                                    case 1:
                                        N = 500,
                                            w = 0;
                                        break;
                                    case 2:
                                        N = 0,
                                            w = -300;
                                        break;
                                    default:
                                        N = -500,
                                            w = 0;
                                }
                                d['visible'] = !0,
                                    d['alpha'] = 0,
                                    d.x = n['shout_origin_x'] + N,
                                    d.y = n['shout_origin_y'] + w,
                                    Laya['Tween'].to(d, {
                                        alpha: 1,
                                        x: n['shout_origin_x'],
                                        y: n['shout_origin_y']
                                    }, 70),
                                    Laya['Tween'].to(d, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya['timer'].once(800, this, function() {
                                        Laya['loader']['clearTextureRes'](M.skin),
                                            d['visible'] = !1;
                                    });
                            } catch (f) {
                                var S = {};
                                S['error'] = f['message'],
                                    S['stack'] = f['stack'],
                                    S['method'] = 'shout',
                                    S['class'] = 'UI_DesktopInfos',
                                    GameMgr.Inst['onFatalError'](S);
                            }
                        },
                        M['prototype']['closeCountDown'] = function() {
                            this['_timecd']['close']();
                        },
                        M['prototype']['refreshFuncBtnShow'] = function(C, v) {
                            var p = C['getChildByName']('img_choosed');
                            C['getChildByName']('out')['color'] = C['mouseEnabled'] ? v ? '#3bd647' : '#7992b3' : '#565656',
                                p['visible'] = v;
                        },
                        M['prototype']['onShowEmo'] = function(C, v) {
                            var p = this['_player_infos'][C];
                            0 != C && p['headbtn']['emj_banned'] || p.emo.show(C, v);
                        },
                        M['prototype']['changeHeadEmo'] = function(C) {
                            {
                                var v = view['DesktopMgr'].Inst['seat2LocalPosition'](C);
                                this['_player_infos'][v];
                            }
                        },
                        M['prototype']['onBtnShowScoreDelta'] = function() {
                            var C = this;
                            this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function() {
                                C['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                        },
                        M['prototype']['btn_seeinfo'] = function(v) {
                            if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst['gameing']) {
                                var p = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](v)]['account_id'];
                                if (p) {
                                    var U = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                        n = 1,
                                        d = view['DesktopMgr'].Inst['game_config'].meta;
                                    d && d['mode_id'] == game['EMatchMode']['shilian'] && (n = 4),
                                        C['UI_OtherPlayerInfo'].Inst.show(p, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, U ? 1 : 2, n);
                                }
                            }
                        },
                        M['prototype']['openDora3BeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openPeipaiOpenBeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openDora3BeginShine'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](244),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openMuyuOpenBeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openShilianOpenBeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openXiuluoOpenBeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openChuanmaBeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openJiuChaoBeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openAnPaiBeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openTopMatchOpenBeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['openZhanxingBeginEffect'] = function() {
                            var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, C, function() {
                                    C['destory']();
                                });
                        },
                        M['prototype']['logUpEmoInfo'] = function() {
                            this['block_emo']['sendEmoLogUp']();
                        },
                        M['prototype']['onCollectChange'] = function() {
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (C['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                        },
                        M['prototype']['showAIEmo'] = function() {
                            for (var C = this, v = function(v) {
                                    var U = view['DesktopMgr'].Inst['player_datas'][v];
                                    U['account_id'] && 0 != U['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), p, function() {
                                        C['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](v), Math['floor'](9 * Math['random']()));
                                    });
                                }, p = this, U = 0; U < view['DesktopMgr'].Inst['player_datas']['length']; U++)
                                v(U);
                        },
                        M['prototype']['setGapType'] = function(C, v) {
                            void 0 === v && (v = !1);
                            for (var p = 0; p < C['length']; p++) {
                                var U = view['DesktopMgr'].Inst['seat2LocalPosition'](p);
                                this['_player_infos'][U].que['visible'] = !0,
                                    v && (0 == p ? (this['_player_infos'][U].que.pos(this['gapStartPosLst'][p].x + this['selfGapOffsetX'][C[p]], this['gapStartPosLst'][p].y), this['_player_infos'][U].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][U].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][U]['que_target_pos'].x,
                                        y: this['_player_infos'][U]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][U].que.pos(this['gapStartPosLst'][p].x, this['gapStartPosLst'][p].y), this['_player_infos'][U].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][U].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][U]['que_target_pos'].x,
                                        y: this['_player_infos'][U]['que_target_pos'].y
                                    }, 200))),
                                    this['_player_infos'][U].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + C[p] + '.png');
                            }
                        },
                        M['prototype']['OnNewCard'] = function(C, v) {
                            if (v) {
                                var p = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, p, function() {
                                        p['destory']();
                                    }),
                                    Laya['timer'].once(1300, this, function() {
                                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                                    });
                            } else
                                this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                        },
                        M['prototype']['ShowSpellCard'] = function(v, p) {
                            void 0 === p && (p = !1),
                                C['UI_FieldSpell'].Inst && !C['UI_FieldSpell'].Inst['enable'] && C['UI_FieldSpell'].Inst.show(v, p);
                        },
                        M['prototype']['HideSpellCard'] = function() {
                            C['UI_FieldSpell'].Inst && C['UI_FieldSpell'].Inst['close']();
                        },
                        M.Inst = null,
                        M;
                }
                (C['UIBase']);
            C['UI_DesktopInfo'] = s;
        }
        (uiscript || (uiscript = {}));


        uiscript.UI_Info.Init = function() {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }

            var a = uiscript.UI_Info;
            // END
            this['read_list'] = [],
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                    lang: GameMgr['client_language'],
                    platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                }, function(U, z) {
                    U || z['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', U, z) : a['_refreshAnnouncements'](z);
                    if ((U || z['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function(l) {
                    for (var U = GameMgr['inDmm'] ? 'web_dmm' : 'web', z = 0, M = l['update_list']; z < M['length']; z++) {
                        var g = M[z];
                        if (g.lang == GameMgr['client_language'] && g['platform'] == U) {
                            a['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));

        }

        uiscript.UI_Info._refreshAnnouncements = function(l) {
            l.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            if (l['announcements'] && (this['announcements'] = l['announcements']), l.sort && (this['announcement_sort'] = l.sort), l['read_list']) {
                this['read_list'] = [];
                for (var a = 0; a < l['read_list']['length']; a++)
                    this['read_list'].push(l['read_list'][a]);
                l.read_list.splice(0, 0, 666666, 777777);
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
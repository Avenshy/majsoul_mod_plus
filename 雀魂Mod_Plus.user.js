// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.10.244
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
        !function (w) {
            var j;
            !function (w) {
                w[w.none = 0] = 'none',
                w[w['daoju'] = 1] = 'daoju',
                w[w.gift = 2] = 'gift',
                w[w['fudai'] = 3] = 'fudai',
                w[w.view = 5] = 'view';
            }
            (j = w['EItemCategory'] || (w['EItemCategory'] = {}));
            var C = function (C) {
                function i() {
                    var w = C.call(this, new ui['lobby']['bagUI']()) || this;
                    return w['container_top'] = null,
                    w['container_content'] = null,
                    w['locking'] = !1,
                    w.tabs = [],
                    w['page_item'] = null,
                    w['page_gift'] = null,
                    w['page_skin'] = null,
                    w['page_cg'] = null,
                    w['select_index'] = 0,
                    i.Inst = w,
                    w;
                }
                return __extends(i, C),
                i.init = function () {
                    var w = this;
                    app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (j) {
                            var C = j['update'];
                            C && C.bag && (w['update_data'](C.bag['update_items']), w['update_daily_gain_data'](C.bag));
                        }, null, !1)),
                    this['fetch']();
                },
                i['fetch'] = function () {
                    var j = this;
                    this['_item_map'] = {},
                    this['_daily_gain_record'] = {},
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (C, i) {
                        if (C || i['error'])
                            w['UIMgr'].Inst['showNetReqError']('fetchBagInfo', C, i);
                        else {
                            app.Log.log('背包信息：' + JSON['stringify'](i));
                            var l = i.bag;
                            if (l) {
                                                if (MMP.settings.setItems.setAllItems) {
                                                    //设置全部道具
                                                    var items = cfg.item_definition.item.map_;
                                                    for (var id in items) {
                                                        if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                            for (let item of l["items"]) {
                                                                if (item.item_id == id) {
                                                                    cfg.item_definition.item.get(item.item_id);
                                                                    j._item_map[item.item_id] = {
                                                                        item_id: item.item_id,
                                                                        count: item.stack,
                                                                        category: items[item.item_id].category
                                                                    };
                                                                    break;
                                                                }
                                                            }
                                                        } else {
                                                            cfg.item_definition.item.get(id);
                                                            j._item_map[id] = {
                                                                item_id: id,
                                                                count: 1,
                                                                category: items[id].category
                                                            }; //获取物品列表并添加
                                                        }
                                                    }
               } else {
                                if (l['items'])
                                    for (var u = 0; u < l['items']['length']; u++) {
                                        var b = l['items'][u]['item_id'],
                                        V = l['items'][u]['stack'],
                                        k = cfg['item_definition'].item.get(b);
                                        k && (j['_item_map'][b] = {
                                                item_id: b,
                                                count: V,
                                                category: k['category']
                                            }, 1 == k['category'] && 3 == k.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                item_id: b
                                            }, function () {}));
                                    }
                                if (l['daily_gain_record'])
                                    for (var S = l['daily_gain_record'], u = 0; u < S['length']; u++) {
                                        var H = S[u]['limit_source_id'];
                                        j['_daily_gain_record'][H] = {};
                                        var N = S[u]['record_time'];
                                        j['_daily_gain_record'][H]['record_time'] = N;
                                        var W = S[u]['records'];
                                        if (W)
                                            for (var e = 0; e < W['length']; e++)
                                                j['_daily_gain_record'][H][W[e]['item_id']] = W[e]['count'];
                                    }
                            }
                        }
        }
                    });
                },
                i['find_item'] = function (w) {
                    var j = this['_item_map'][w];
                    return j ? {
                        item_id: j['item_id'],
                        category: j['category'],
                        count: j['count']
                    }
                     : null;
                },
                i['get_item_count'] = function (w) {
                    var j = this['find_item'](w);
                    if (j)
                        return j['count'];
                    if ('100001' == w) {
                        for (var C = 0, i = 0, l = GameMgr.Inst['free_diamonds']; i < l['length']; i++) {
                            var u = l[i];
                            GameMgr.Inst['account_numerical_resource'][u] && (C += GameMgr.Inst['account_numerical_resource'][u]);
                        }
                        for (var b = 0, V = GameMgr.Inst['paid_diamonds']; b < V['length']; b++) {
                            var u = V[b];
                            GameMgr.Inst['account_numerical_resource'][u] && (C += GameMgr.Inst['account_numerical_resource'][u]);
                        }
                        return C;
                    }
                    if ('100004' == w) {
                        for (var k = 0, S = 0, H = GameMgr.Inst['free_pifuquans']; S < H['length']; S++) {
                            var u = H[S];
                            GameMgr.Inst['account_numerical_resource'][u] && (k += GameMgr.Inst['account_numerical_resource'][u]);
                        }
                        for (var N = 0, W = GameMgr.Inst['paid_pifuquans']; N < W['length']; N++) {
                            var u = W[N];
                            GameMgr.Inst['account_numerical_resource'][u] && (k += GameMgr.Inst['account_numerical_resource'][u]);
                        }
                        return k;
                    }
                    return '100002' == w ? GameMgr.Inst['account_data'].gold : 0;
                },
                i['find_items_by_category'] = function (w) {
                    var j = [];
                    for (var C in this['_item_map'])
                        this['_item_map'][C]['category'] == w && j.push({
                            item_id: this['_item_map'][C]['item_id'],
                            category: this['_item_map'][C]['category'],
                            count: this['_item_map'][C]['count']
                        });
                    return j;
                },
                i['update_data'] = function (j) {
                    for (var C = 0; C < j['length']; C++) {
                        var i = j[C]['item_id'],
                        l = j[C]['stack'];
                        if (l > 0) {
                            this['_item_map']['hasOwnProperty'](i['toString']()) ? this['_item_map'][i]['count'] = l : this['_item_map'][i] = {
                                item_id: i,
                                count: l,
                                category: cfg['item_definition'].item.get(i)['category']
                            };
                            var u = cfg['item_definition'].item.get(i);
                            1 == u['category'] && 3 == u.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                item_id: i
                            }, function () {}),
                            5 == u['category'] && (this['new_bag_item_ids'].push(i), this['new_zhuangban_item_ids'][i] = 1),
                            8 != u['category'] || u['item_expire'] || this['new_cg_ids'].push(i);
                        } else if (this['_item_map']['hasOwnProperty'](i['toString']())) {
                            var b = cfg['item_definition'].item.get(i);
                            b && 5 == b['category'] && w['UI_Sushe']['on_view_remove'](i),
                            this['_item_map'][i] = 0,
                            delete this['_item_map'][i];
                        }
                    }
                    this.Inst && this.Inst['when_data_change']();
                    for (var C = 0; C < j['length']; C++) {
                        var i = j[C]['item_id'];
                        if (this['_item_listener']['hasOwnProperty'](i['toString']()))
                            for (var V = this['_item_listener'][i], k = 0; k < V['length']; k++)
                                V[k].run();
                    }
                    for (var C = 0; C < this['_all_item_listener']['length']; C++)
                        this['_all_item_listener'][C].run();
                },
                i['update_daily_gain_data'] = function (w) {
                    var j = w['update_daily_gain_record'];
                    if (j)
                        for (var C = 0; C < j['length']; C++) {
                            var i = j[C]['limit_source_id'];
                            this['_daily_gain_record'][i] || (this['_daily_gain_record'][i] = {});
                            var l = j[C]['record_time'];
                            this['_daily_gain_record'][i]['record_time'] = l;
                            var u = j[C]['records'];
                            if (u)
                                for (var b = 0; b < u['length']; b++)
                                    this['_daily_gain_record'][i][u[b]['item_id']] = u[b]['count'];
                        }
                },
                i['get_item_daily_record'] = function (w, j) {
                    return this['_daily_gain_record'][w] ? this['_daily_gain_record'][w]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][w]['record_time']) ? this['_daily_gain_record'][w][j] ? this['_daily_gain_record'][w][j] : 0 : 0 : 0 : 0;
                },
                i['add_item_listener'] = function (w, j) {
                    this['_item_listener']['hasOwnProperty'](w['toString']()) || (this['_item_listener'][w] = []),
                    this['_item_listener'][w].push(j);
                },
                i['remove_item_listener'] = function (w, j) {
                    var C = this['_item_listener'][w];
                    if (C)
                        for (var i = 0; i < C['length']; i++)
                            if (C[i] === j) {
                                C[i] = C[C['length'] - 1],
                                C.pop();
                                break;
                            }
                },
                i['add_all_item_listener'] = function (w) {
                    this['_all_item_listener'].push(w);
                },
                i['remove_all_item_listener'] = function (w) {
                    for (var j = this['_all_item_listener'], C = 0; C < j['length']; C++)
                        if (j[C] === w) {
                            j[C] = j[j['length'] - 1],
                            j.pop();
                            break;
                        }
                },
                i['removeAllBagNew'] = function () {
                    this['new_bag_item_ids'] = [];
                },
                i['removeAllCGNew'] = function () {
                    this['new_cg_ids'] = [];
                },
                i['removeZhuangBanNew'] = function (w) {
                    for (var j = 0, C = w; j < C['length']; j++) {
                        var i = C[j];
                        delete this['new_zhuangban_item_ids'][i];
                    }
                },
                i['prototype']['have_red_point'] = function () {
                    return this['page_cg']['have_redpoint']();
                },
                i['prototype']['onCreate'] = function () {
                    var j = this;
                    this['container_top'] = this.me['getChildByName']('top'),
                    this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['locking'] || j.hide(Laya['Handler']['create'](j, function () {
                                    return j['closeHandler'] ? (j['closeHandler'].run(), j['closeHandler'] = null, void 0) : (w['UI_Lobby'].Inst['enable'] = !0, void 0);
                                }));
                        }, null, !1),
                    this['container_content'] = this.me['getChildByName']('content');
                    for (var C = function (w) {
                        i.tabs.push(i['container_content']['getChildByName']('tabs')['getChildByName']('btn' + w)),
                        i.tabs[w]['clickHandler'] = Laya['Handler']['create'](i, function () {
                                j['select_index'] != w && j['on_change_tab'](w);
                            }, null, !1);
                    }, i = this, l = 0; 5 > l; l++)
                        C(l);
                    this['page_item'] = new w['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                    this['page_gift'] = new w['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                    this['page_skin'] = new w['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                    this['page_cg'] = new w['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                },
                i['prototype'].show = function (j, C) {
                    var i = this;
                    void 0 === j && (j = 0),
                    void 0 === C && (C = null),
                    this['enable'] = !0,
                    this['locking'] = !0,
                    this['closeHandler'] = C,
                    w['UIBase']['anim_alpha_in'](this['container_top'], {
                        y: -30
                    }, 200),
                    w['UIBase']['anim_alpha_in'](this['container_content'], {
                        y: 30
                    }, 200),
                    Laya['timer'].once(300, this, function () {
                        i['locking'] = !1;
                    }),
                    this['on_change_tab'](j),
                    this['refreshRedpoint'](),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                },
                i['prototype']['onSkinYuLanBack'] = function () {
                    var j = this;
                    this['enable'] = !0,
                    this['locking'] = !0,
                    w['UIBase']['anim_alpha_in'](this['container_top'], {
                        y: -30
                    }, 200),
                    w['UIBase']['anim_alpha_in'](this['container_content'], {
                        y: 30
                    }, 200),
                    Laya['timer'].once(300, this, function () {
                        j['locking'] = !1;
                    }),
                    this['page_skin'].me['visible'] = !0,
                    this['refreshRedpoint'](),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                },
                i['prototype'].hide = function (j) {
                    var C = this;
                    this['locking'] = !0,
                    w['UIBase']['anim_alpha_out'](this['container_top'], {
                        y: -30
                    }, 200),
                    w['UIBase']['anim_alpha_out'](this['container_content'], {
                        y: 30
                    }, 200),
                    Laya['timer'].once(300, this, function () {
                        C['locking'] = !1,
                        C['enable'] = !1,
                        j && j.run();
                    });
                },
                i['prototype']['onDisable'] = function () {
                    this['page_skin']['close'](),
                    this['page_item']['close'](),
                    this['page_gift']['close'](),
                    this['page_cg']['close']();
                },
                i['prototype']['on_change_tab'] = function (w) {
                    this['select_index'] = w;
                    for (var C = 0; C < this.tabs['length']; C++)
                        this.tabs[C].skin = game['Tools']['localUISrc'](w == C ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[C]['getChildAt'](0)['color'] = w == C ? '#d9b263' : '#8cb65f';
                    switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), w) {
                    case 0:
                        this['page_item'].show(j['daoju']);
                        break;
                    case 1:
                        this['page_gift'].show();
                        break;
                    case 2:
                        this['page_item'].show(j.view);
                        break;
                    case 3:
                        this['page_skin'].show();
                        break;
                    case 4:
                        this['page_cg'].show();
                    }
                },
                i['prototype']['when_data_change'] = function () {
                    this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                    this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                },
                i['prototype']['on_cg_change'] = function () {
                    this['page_cg']['when_update_data']();
                },
                i['prototype']['refreshRedpoint'] = function () {
                    this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                },
                i['_item_map'] = {},
                i['_item_listener'] = {},
                i['_all_item_listener'] = [],
                i['_daily_gain_record'] = {},
                i['new_bag_item_ids'] = [],
                i['new_zhuangban_item_ids'] = {},
                i['new_cg_ids'] = [],
                i.Inst = null,
                i;
            }
            (w['UIBase']);
            w['UI_Bag'] = C;
        }
        (uiscript || (uiscript = {}));
        








        // 修改牌桌上角色
        !function (w) {
            var j = function () {
                function j() {
                    var j = this;
                    this.urls = [],
                    this['link_index'] = -1,
                    this['connect_state'] = w['EConnectState'].none,
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
                    app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function (w) {
         if (MMP.settings.sendGame == true) {
                                        (GM_xmlhttpRequest({
                                            method: 'post',
                                            url: MMP.settings.sendGameURL,
                                            data: JSON.stringify(w),
                                            onload: function (msg) {
                                                console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(w));
                                            }
                                        }));
                                    }
                            app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](w)),
                            j['loaded_player_count'] = w['ready_id_list']['length'],
                            j['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](j['loaded_player_count'], j['real_player_count']);
                        }));
                }
                return Object['defineProperty'](j, 'Inst', {
                    get: function () {
                        return null == this['_Inst'] ? this['_Inst'] = new j() : this['_Inst'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                j['prototype']['OpenConnect'] = function (j, C, i, l) {
                    var u = this;
                    uiscript['UI_Loading'].Inst.show('enter_mj'),
                    w['Scene_Lobby'].Inst && w['Scene_Lobby'].Inst['active'] && (w['Scene_Lobby'].Inst['active'] = !1),
                    w['Scene_Huiye'].Inst && w['Scene_Huiye'].Inst['active'] && (w['Scene_Huiye'].Inst['active'] = !1),
                    this['Close'](),
                    view['BgmListMgr']['stopBgm'](),
                    this['is_ob'] = !1,
                    Laya['timer'].once(500, this, function () {
                        u.url = '',
                        u['token'] = j,
                        u['game_uuid'] = C,
                        u['server_location'] = i,
                        GameMgr.Inst['ingame'] = !0,
                        GameMgr.Inst['mj_server_location'] = i,
                        GameMgr.Inst['mj_game_token'] = j,
                        GameMgr.Inst['mj_game_uuid'] = C,
                        u['playerreconnect'] = l,
                        u['_setState'](w['EConnectState']['tryconnect']),
                        u['load_over'] = !1,
                        u['loaded_player_count'] = 0,
                        u['real_player_count'] = 0,
                        u['lb_index'] = 0,
                        u['_fetch_gateway'](0);
                    }),
                    Laya['timer'].loop(300000, this, this['reportInfo']);
                },
                j['prototype']['reportInfo'] = function () {
                    this['connect_state'] == w['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                        client_type: 'web',
                        route_type: 'game',
                        route_index: w['LobbyNetMgr']['root_id_lst'][w['LobbyNetMgr'].Inst['choosed_index']],
                        route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                        connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                        reconnect_count: this['_report_reconnect_count']
                    });
                },
                j['prototype']['Close'] = function () {
                    this['load_over'] = !1,
                    app.Log.log('MJNetMgr close'),
                    this['_setState'](w['EConnectState'].none),
                    app['NetAgent']['Close2MJ'](),
                    this.url = '',
                    Laya['timer']['clear'](this, this['reportInfo']);
                },
                j['prototype']['_OnConnent'] = function (j) {
                    app.Log.log('MJNetMgr _OnConnent event:' + j),
                    j == Laya['Event']['CLOSE'] || j == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == w['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == w['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](w['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](w['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](2008)), w['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == w['EConnectState']['reconnecting'] && this['_Reconnect']()) : j == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == w['EConnectState']['tryconnect'] || this['connect_state'] == w['EConnectState']['reconnecting']) && ((this['connect_state'] = w['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](w['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                },
                j['prototype']['_Reconnect'] = function () {
                    var j = this;
                    w['LobbyNetMgr'].Inst['connect_state'] == w['EConnectState'].none || w['LobbyNetMgr'].Inst['connect_state'] == w['EConnectState']['disconnect'] ? this['_setState'](w['EConnectState']['disconnect']) : w['LobbyNetMgr'].Inst['connect_state'] == w['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](w['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            j['connect_state'] == w['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + j['reconnect_count']), app['NetAgent']['connect2MJ'](j.url, Laya['Handler']['create'](j, j['_OnConnent'], null, !1), 'local' == j['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                },
                j['prototype']['_try_to_linknext'] = function () {
                    this['link_index']++,
                    this.url = '',
                    app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                    this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? w['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](w['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && w['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                },
                j['prototype']['GetAuthData'] = function () {
                    return {
                        account_id: GameMgr.Inst['account_id'],
                        token: this['token'],
                        game_uuid: this['game_uuid'],
                        gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                    };
                },
                j['prototype']['_fetch_gateway'] = function (j) {
                    var C = this;
                    if (w['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= w['LobbyNetMgr'].Inst.urls['length'])
                        return uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && w['Scene_MJ'].Inst['ForceOut'](), this['_setState'](w['EConnectState'].none), void 0;
                    this.urls = [],
                    this['link_index'] = -1,
                    app.Log.log('mj _fetch_gateway retry_count:' + j);
                    var i = function (i) {
                        var l = JSON['parse'](i);
                        if (app.Log.log('mj _fetch_gateway func_success data = ' + i), l['maintenance'])
                            C['_setState'](w['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && w['Scene_MJ'].Inst['ForceOut']();
                        else if (l['servers'] && l['servers']['length'] > 0) {
                            for (var u = l['servers'], b = w['Tools']['deal_gateway'](u), V = 0; V < b['length']; V++)
                                C.urls.push({
                                    name: '___' + V,
                                    url: b[V]
                                });
                            C['link_index'] = -1,
                            C['_try_to_linknext']();
                        } else
                            1 > j ? Laya['timer'].once(1000, C, function () {
                                C['_fetch_gateway'](j + 1);
                            }) : w['LobbyNetMgr'].Inst['polling_connect'] ? (C['lb_index']++, C['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](60)), C['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && w['Scene_MJ'].Inst['ForceOut'](), C['_setState'](w['EConnectState'].none));
                    },
                    l = function () {
                        app.Log.log('mj _fetch_gateway func_error'),
                        1 > j ? Laya['timer'].once(500, C, function () {
                            C['_fetch_gateway'](j + 1);
                        }) : w['LobbyNetMgr'].Inst['polling_connect'] ? (C['lb_index']++, C['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](58)), C['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || w['Scene_MJ'].Inst['ForceOut'](), C['_setState'](w['EConnectState'].none));
                    },
                    u = function (w) {
                        var j = new Laya['HttpRequest']();
                        j.once(Laya['Event']['COMPLETE'], C, function (w) {
                            i(w);
                        }),
                        j.once(Laya['Event']['ERROR'], C, function () {
                            l();
                        });
                        var u = [];
                        u.push('If-Modified-Since'),
                        u.push('0'),
                        w += '?service=ws-game-gateway',
                        w += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                        w += '&location=' + C['server_location'],
                        w += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                        j.send(w, '', 'get', 'text', u),
                        app.Log.log('mj _fetch_gateway func_fetch url = ' + w);
                    };
                    w['LobbyNetMgr'].Inst['polling_connect'] ? u(w['LobbyNetMgr'].Inst.urls[this['lb_index']]) : u(w['LobbyNetMgr'].Inst['lb_url']);
                },
                j['prototype']['_setState'] = function (j) {
                    this['connect_state'] = j,
                    GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (j == w['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : j == w['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : j == w['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : j == w['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : j == w['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                },
                j['prototype']['_ConnectSuccess'] = function () {
                    var j = this;
                    app.Log.log('MJNetMgr _ConnectSuccess '),
                    this['load_over'] = !1,
                    app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (C, i) {
                        if (C || i['error'])
                            uiscript['UIMgr'].Inst['showNetReqError']('authGame', C, i), w['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                        else {
                            app.Log.log('麻将桌验证通过：' + JSON['stringify'](i)),
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                            // 强制打开便捷提示
                                            if (MMP.settings.setbianjietishi) {
                                                i['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                            }
                                            // END
                                            // 增加对mahjong-helper的兼容
                                            // 发送游戏对局
                                            if (MMP.settings.sendGame == true) {
                                                GM_xmlhttpRequest({
                                                    method: 'post',
                                                    url: MMP.settings.sendGameURL,
                                                    data: JSON.stringify(i),
                                                    onload: function (msg) {
                                                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(i));
                                                    }
                                                });
                                            }
                                            // END
                            var l = [],
                            u = 0;
                            view['DesktopMgr']['player_link_state'] = i['state_list'];
                            var b = w['Tools']['strOfLocalization'](2003),
                            V = i['game_config'].mode,
                            k = view['ERuleMode']['Liqi4'];
                            V.mode < 10 ? (k = view['ERuleMode']['Liqi4'], j['real_player_count'] = 4) : V.mode < 20 && (k = view['ERuleMode']['Liqi3'], j['real_player_count'] = 3);
                            for (var S = 0; S < j['real_player_count']; S++)
                                l.push(null);
                            V['extendinfo'] && (b = w['Tools']['strOfLocalization'](2004)),
                            V['detail_rule'] && V['detail_rule']['ai_level'] && (1 === V['detail_rule']['ai_level'] && (b = w['Tools']['strOfLocalization'](2003)), 2 === V['detail_rule']['ai_level'] && (b = w['Tools']['strOfLocalization'](2004)));
                            for (var H = w['GameUtility']['get_default_ai_skin'](), N = w['GameUtility']['get_default_ai_character'](), S = 0; S < i['seat_list']['length']; S++) {
                                var W = i['seat_list'][S];
                                if (0 == W) {
                                    l[S] = {
                                        nickname: b,
                                        avatar_id: H,
                                        level: {
                                            id: '10101'
                                        },
                                        level3: {
                                            id: '20101'
                                        },
                                        character: {
                                            charid: N,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: H,
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
                                                             l[S].avatar_id = skin.id;
                                                             l[S].character.charid = skin.character_id;
                                                            l[S].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                          l[S].nickname = '[BOT]' +   l[S].nickname;
                                                    }
                               } else {
                                    u++;
                                    for (var e = 0; e < i['players']['length']; e++)
                                        if (i['players'][e]['account_id'] == W) {
                                            l[S] = i['players'][e];
                                                            //修改牌桌上人物头像及皮肤
                                                            if (  l[S].account_id == GameMgr.Inst.account_id) {
                                                                  l[S].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                                  l[S].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                                  l[S].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                                  l[S].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                                  l[S].title = GameMgr.Inst.account_data.title;
                                                                if (MMP.settings.nickname != '') {
                                                                      l[S].nickname = MMP.settings.nickname;
                                                                }
                                                            } else if (MMP.settings.randomPlayerDefSkin && (  l[S].avatar_id == 400101 ||   l[S].avatar_id == 400201)) {
                                                                //玩家如果用了默认皮肤也随机换
                                                                let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                                let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                                let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                                // 修复皮肤错误导致无法进入游戏的bug
                                                                if (skin.id != 400000 && skin.id != 400001) {
                                                                     l[S].avatar_id = skin.id;
                                                                     l[S].character.charid = skin.character_id;
                                                                     l[S].character.skin = skin.id;
                                                                }
                                                            }
                                                            if (MMP.settings.showServer == true) {
                                                                let server = game.Tools.get_zone_id(  l[S].account_id);
                                                                if (server == 1) {
                                                                     l[S].nickname = '[CN]' +   l[S].nickname;
                                                                } else if (server == 2) {
                                                                     l[S].nickname = '[JP]' +   l[S].nickname;
                                                                } else if (server == 3) {
                                                                      l[S].nickname = '[EN]' +   l[S].nickname;
                                                                } else {
                                                                      l[S].nickname = '[??]' +   l[S].nickname;
                                                                }
                                                            }
                                                            // END
                                            break;
                                        }
                                }
                            }
                            for (var S = 0; S < j['real_player_count']; S++)
                                null == l[S] && (l[S] = {
                                        account: 0,
                                        nickname: w['Tools']['strOfLocalization'](2010),
                                        avatar_id: H,
                                        level: {
                                            id: '10101'
                                        },
                                        level3: {
                                            id: '20101'
                                        },
                                        character: {
                                            charid: N,
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: H,
                                            is_upgraded: !1
                                        }
                                    });
                            j['loaded_player_count'] = i['ready_id_list']['length'],
                            j['_AuthSuccess'](l, i['is_game_start'], i['game_config']['toJSON']());
                        }
                    });
                },
                j['prototype']['_AuthSuccess'] = function (j, C, i) {
                    var l = this;
                    view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                            view['DesktopMgr'].Inst['Reset'](),
                            view['DesktopMgr'].Inst['duringReconnect'] = !0,
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                round_id: view['DesktopMgr'].Inst['round_id'],
                                step: view['DesktopMgr'].Inst['current_step']
                            }, function (j, C) {
                                j || C['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', j, C), w['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](C)), C['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](2011)), w['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](C['game_restore'])));
                            });
                        })) : w['Scene_MJ'].Inst['openMJRoom'](i, j, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](i)), j, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](l, function () {
                                    C ? Laya['timer']['frameOnce'](10, l, function () {
                                        app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (j, C) {
                                            app.Log.log('syncGame ' + JSON['stringify'](C)),
                                            j || C['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', j, C), w['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), l['_PlayerReconnectSuccess'](C));
                                        });
                                    }) : Laya['timer']['frameOnce'](10, l, function () {
                                        app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (j, C) {
                                            j || C['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', j, C), w['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), l['_EnterGame'](C), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                    });
                                }));
                        }), Laya['Handler']['create'](this, function (w) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * w);
                        }, null, !1));
                },
                j['prototype']['_EnterGame'] = function (j) {
                    app.Log.log('正常进入游戏: ' + JSON['stringify'](j)),
                    j['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](2011)), w['Scene_MJ'].Inst['GameEnd']()) : j['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](j['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                },
                j['prototype']['_PlayerReconnectSuccess'] = function (j) {
                    app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](j)),
                    j['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](2011)), w['Scene_MJ'].Inst['GameEnd']()) : j['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](j['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](w['Tools']['strOfLocalization'](2012)), w['Scene_MJ'].Inst['ForceOut']());
                },
                j['prototype']['_SendDebugInfo'] = function () {},
                j['prototype']['OpenConnectObserve'] = function (j, C) {
                    var i = this;
                    this['is_ob'] = !0,
                    uiscript['UI_Loading'].Inst.show('enter_mj'),
                    this['Close'](),
                    view['AudioMgr']['StopMusic'](),
                    Laya['timer'].once(500, this, function () {
                        i['server_location'] = C,
                        i['ob_token'] = j,
                        i['_setState'](w['EConnectState']['tryconnect']),
                        i['lb_index'] = 0,
                        i['_fetch_gateway'](0);
                    });
                },
                j['prototype']['_ConnectSuccessOb'] = function () {
                    var j = this;
                    app.Log.log('MJNetMgr _ConnectSuccessOb '),
                    app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                        token: this['ob_token']
                    }, function (C, i) {
                        C || i['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', C, i), w['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](i)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (C, i) {
                                if (C || i['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('startObserve', C, i), w['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    var l = i.head,
                                    u = l['game_config'].mode,
                                    b = [],
                                    V = w['Tools']['strOfLocalization'](2003),
                                    k = view['ERuleMode']['Liqi4'];
                                    u.mode < 10 ? (k = view['ERuleMode']['Liqi4'], j['real_player_count'] = 4) : u.mode < 20 && (k = view['ERuleMode']['Liqi3'], j['real_player_count'] = 3);
                                    for (var S = 0; S < j['real_player_count']; S++)
                                        b.push(null);
                                    u['extendinfo'] && (V = w['Tools']['strOfLocalization'](2004)),
                                    u['detail_rule'] && u['detail_rule']['ai_level'] && (1 === u['detail_rule']['ai_level'] && (V = w['Tools']['strOfLocalization'](2003)), 2 === u['detail_rule']['ai_level'] && (V = w['Tools']['strOfLocalization'](2004)));
                                    for (var H = w['GameUtility']['get_default_ai_skin'](), N = w['GameUtility']['get_default_ai_character'](), S = 0; S < l['seat_list']['length']; S++) {
                                        var W = l['seat_list'][S];
                                        if (0 == W)
                                            b[S] = {
                                                nickname: V,
                                                avatar_id: H,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: N,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: H,
                                                    is_upgraded: !1
                                                }
                                            };
                                        else
                                            for (var e = 0; e < l['players']['length']; e++)
                                                if (l['players'][e]['account_id'] == W) {
                                                    b[S] = l['players'][e];
                                                    break;
                                                }
                                    }
                                    for (var S = 0; S < j['real_player_count']; S++)
                                        null == b[S] && (b[S] = {
                                                account: 0,
                                                nickname: w['Tools']['strOfLocalization'](2010),
                                                avatar_id: H,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: N,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: H,
                                                    is_upgraded: !1
                                                }
                                            });
                                    j['_StartObSuccuess'](b, i['passed'], l['game_config']['toJSON'](), l['start_time']);
                                }
                            }));
                    });
                },
                j['prototype']['_StartObSuccuess'] = function (j, C, i, l) {
                    var u = this;
                    view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                            view['DesktopMgr'].Inst['Reset'](),
                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](l, C);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), w['Scene_MJ'].Inst['openMJRoom'](i, j, Laya['Handler']['create'](this, function () {
                                view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](i)), j, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](u, function () {
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                        Laya['timer'].once(1000, u, function () {
                                            GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](l, C);
                                        });
                                    }));
                            }), Laya['Handler']['create'](this, function (w) {
                                return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * w);
                            }, null, !1)));
                },
                j['_Inst'] = null,
                j;
            }
            ();
            w['MJNetMgr'] = j;
        }
        (game || (game = {}));
        






        // 读取战绩
        !function (w) {
            var j = function (j) {
                function C() {
                    var w = j.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                    return w['account_id'] = 0,
                    w['origin_x'] = 0,
                    w['origin_y'] = 0,
                    w.root = null,
                    w['title'] = null,
                    w['level'] = null,
                    w['btn_addfriend'] = null,
                    w['btn_report'] = null,
                    w['illust'] = null,
                    w.name = null,
                    w['detail_data'] = null,
                    w['achievement_data'] = null,
                    w['locking'] = !1,
                    w['tab_info4'] = null,
                    w['tab_info3'] = null,
                    w['tab_note'] = null,
                    w['tab_img_dark'] = '',
                    w['tab_img_chosen'] = '',
                    w['player_data'] = null,
                    w['tab_index'] = 1,
                    w['game_category'] = 1,
                    w['game_type'] = 1,
                    C.Inst = w,
                    w;
                }
                return __extends(C, j),
                C['prototype']['onCreate'] = function () {
                    var j = this;
                    'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                    this.root = this.me['getChildByName']('root'),
                    this['origin_x'] = this.root.x,
                    this['origin_y'] = this.root.y,
                    this['container_info'] = this.root['getChildByName']('container_info'),
                    this['title'] = new w['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                    this.name = this['container_info']['getChildByName']('name'),
                    this['level'] = new w['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                    this['detail_data'] = new w['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                    this['achievement_data'] = new w['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                    this['illust'] = new w['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                    this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                    this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['btn_addfriend']['visible'] = !1,
                            j['btn_report'].x = 343,
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                target_id: j['account_id']
                            }, function () {});
                        }, null, !1),
                    this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                    this['btn_report']['clickHandler'] = new Laya['Handler'](this, function () {
                            w['UI_Report_Nickname'].Inst.show(j['account_id']);
                        }),
                    this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['locking'] || j['close']();
                        }, null, !1),
                    this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['close']();
                        }, null, !1),
                    this.note = new w['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                    this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                    this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['locking'] || 1 != j['tab_index'] && j['changeMJCategory'](1);
                        }, null, !1),
                    this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                    this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['locking'] || 2 != j['tab_index'] && j['changeMJCategory'](2);
                        }, null, !1),
                    this['tab_note'] = this.root['getChildByName']('tab_note'),
                    this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? w['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : j['container_info']['visible'] && (j['container_info']['visible'] = !1, j['tab_info4'].skin = j['tab_img_dark'], j['tab_info3'].skin = j['tab_img_dark'], j['tab_note'].skin = j['tab_img_chosen'], j['tab_index'] = 3, j.note.show()));
                        }, null, !1),
                    this['locking'] = !1;
                },
                C['prototype'].show = function (j, C, i, l) {
                    var u = this;
                    void 0 === C && (C = 1),
                    void 0 === i && (i = 2),
                    void 0 === l && (l = 1),
                    GameMgr.Inst['BehavioralStatistics'](14),
                    this['account_id'] = j,
                    this['enable'] = !0,
                    this['locking'] = !0,
                    this.root.y = this['origin_y'],
                    this['player_data'] = null,
                    w['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            u['locking'] = !1;
                        })),
                    this['detail_data']['reset'](),
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                        account_id: j
                    }, function (C, i) {
                        C || i['error'] ? w['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', C, i) : w['UI_Shilian']['now_season_info'] && 1001 == w['UI_Shilian']['now_season_info']['season_id'] && 3 != w['UI_Shilian']['get_cur_season_state']() ? (u['detail_data']['setData'](i), u['changeMJCategory'](u['tab_index'], u['game_category'], u['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                            account_id: j
                        }, function (j, C) {
                            j || C['error'] ? w['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', j, C) : (i['season_info'] = C['season_info'], u['detail_data']['setData'](i), u['changeMJCategory'](u['tab_index'], u['game_category'], u['game_type']));
                        });
                    }),
                    this.note['init_data'](j),
                    this['refreshBaseInfo'](),
                    this['btn_report']['visible'] = j != GameMgr.Inst['account_id'],
                    this['tab_index'] = C,
                    this['game_category'] = i,
                    this['game_type'] = l,
                    this['container_info']['visible'] = !0,
                    this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_note'].skin = this['tab_img_dark'],
                    this.note['close'](),
                    this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                    this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                },
                C['prototype']['refreshBaseInfo'] = function () {
                    var j = this;
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
                    }, function (C, i) {
                        if (C || i['error'])
                            w['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', C, i);
                        else {
                            var l = i['account'];
                                            //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                            if (l.account_id == GameMgr.Inst.account_id) {
                                                l.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                                    l.title = GameMgr.Inst.account_data.title;
                                                if (MMP.settings.nickname != '') {
                                                    l.nickname = MMP.settings.nickname;
                                                }
                                            }
                                            //end
                            j['player_data'] = l,
                            game['Tools']['SetNickname'](j.name, l),
                            j['title'].id = game['Tools']['titleLocalization'](l['account_id'], l['title']),
                            j['level'].id = l['level'].id,
                            j['level'].id = j['player_data'][1 == j['tab_index'] ? 'level' : 'level3'].id,
                            j['level'].exp = j['player_data'][1 == j['tab_index'] ? 'level' : 'level3']['score'],
                            j['illust'].me['visible'] = !0,
                            j['account_id'] == GameMgr.Inst['account_id'] ? j['illust']['setSkin'](l['avatar_id'], 'waitingroom') : j['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](l['avatar_id']), 'waitingroom'),
                            game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], j['account_id']) && j['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(j['account_id']) ? (j['btn_addfriend']['visible'] = !0, j['btn_report'].x = 520) : (j['btn_addfriend']['visible'] = !1, j['btn_report'].x = 343),
                            j.note.sign['setSign'](l['signature']),
                            j['achievement_data'].show(!1, l['achievement_count']);
                        }
                    });
                },
                C['prototype']['changeMJCategory'] = function (w, j, C) {
                    void 0 === j && (j = 2),
                    void 0 === C && (C = 1),
                    this['tab_index'] = w,
                    this['container_info']['visible'] = !0,
                    this['detail_data']['changeMJCategory'](w, j, C),
                    this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                    this['tab_note'].skin = this['tab_img_dark'],
                    this.note['close'](),
                    this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                },
                C['prototype']['close'] = function () {
                    var j = this;
                    this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), w['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    j['locking'] = !1,
                                    j['enable'] = !1;
                                }))));
                },
                C['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                },
                C['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                    this['detail_data']['close'](),
                    this['illust']['clear'](),
                    Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                },
                C.Inst = null,
                C;
            }
            (w['UIBase']);
            w['UI_OtherPlayerInfo'] = j;
        }
        (uiscript || (uiscript = {}));
        







        // 宿舍相关
        !function (w) {
            var j = function () {
                function j(j, i) {
                    var l = this;
                    this['_scale'] = 1,
                    this['during_move'] = !1,
                    this['mouse_start_x'] = 0,
                    this['mouse_start_y'] = 0,
                    this.me = j,
                    this['container_illust'] = i,
                    this['illust'] = this['container_illust']['getChildByName']('illust'),
                    this['container_move'] = j['getChildByName']('move'),
                    this['container_move'].on('mousedown', this, function () {
                        l['during_move'] = !0,
                        l['mouse_start_x'] = l['container_move']['mouseX'],
                        l['mouse_start_y'] = l['container_move']['mouseY'];
                    }),
                    this['container_move'].on('mousemove', this, function () {
                        l['during_move'] && (l.move(l['container_move']['mouseX'] - l['mouse_start_x'], l['container_move']['mouseY'] - l['mouse_start_y']), l['mouse_start_x'] = l['container_move']['mouseX'], l['mouse_start_y'] = l['container_move']['mouseY']);
                    }),
                    this['container_move'].on('mouseup', this, function () {
                        l['during_move'] = !1;
                    }),
                    this['container_move'].on('mouseout', this, function () {
                        l['during_move'] = !1;
                    }),
                    this['btn_close'] = j['getChildByName']('btn_close'),
                    this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            l['locking'] || l['close']();
                        }, null, !1),
                    this['scrollbar'] = j['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                    this['scrollbar'].init(new Laya['Handler'](this, function (w) {
                            l['_scale'] = 1 * (1 - w) + 0.5,
                            l['illust']['scaleX'] = l['_scale'],
                            l['illust']['scaleY'] = l['_scale'],
                            l['scrollbar']['setVal'](w, 0);
                        })),
                    this['dongtai_kaiguan'] = new w['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                                C.Inst['illust']['resetSkin']();
                            }), new Laya['Handler'](this, function (w) {
                                C.Inst['illust']['playAnim'](w);
                            })),
                    this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](j['prototype'], 'scale', {
                    get: function () {
                        return this['_scale'];
                    },
                    set: function (w) {
                        this['_scale'] = w,
                        this['scrollbar']['setVal'](1 - (w - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                j['prototype'].show = function (j) {
                    var i = this;
                    this['locking'] = !0,
                    this['when_close'] = j,
                    this['illust_start_x'] = this['illust'].x,
                    this['illust_start_y'] = this['illust'].y,
                    this['illust_center_x'] = this['illust'].x + 984 - 446,
                    this['illust_center_y'] = this['illust'].y + 11 - 84,
                    this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                    this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                    this['container_illust']['getChildByName']('btn')['visible'] = !1,
                    C.Inst['stopsay'](),
                    this['scale'] = 1,
                    Laya['Tween'].to(this['illust'], {
                        x: this['illust_center_x'],
                        y: this['illust_center_y']
                    }, 200),
                    w['UIBase']['anim_pop_out'](this['btn_close'], null),
                    this['during_move'] = !1,
                    Laya['timer'].once(250, this, function () {
                        i['locking'] = !1;
                    }),
                    this.me['visible'] = !0,
                    this['dongtai_kaiguan']['refresh'](C.Inst['illust']['skin_id']);
                },
                j['prototype']['close'] = function () {
                    var j = this;
                    this['locking'] = !0,
                    'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                    this['container_illust']['getChildByName']('btn')['visible'] = !0,
                    Laya['Tween'].to(this['illust'], {
                        x: this['illust_start_x'],
                        y: this['illust_start_y'],
                        scaleX: 1,
                        scaleY: 1
                    }, 200),
                    w['UIBase']['anim_pop_hide'](this['btn_close'], null),
                    Laya['timer'].once(250, this, function () {
                        j['locking'] = !1,
                        j.me['visible'] = !1,
                        j['when_close'].run();
                    });
                },
                j['prototype'].move = function (w, j) {
                    var C = this['illust'].x + w,
                    i = this['illust'].y + j;
                    C < this['illust_center_x'] - 600 ? C = this['illust_center_x'] - 600 : C > this['illust_center_x'] + 600 && (C = this['illust_center_x'] + 600),
                    i < this['illust_center_y'] - 1200 ? i = this['illust_center_y'] - 1200 : i > this['illust_center_y'] + 800 && (i = this['illust_center_y'] + 800),
                    this['illust'].x = C,
                    this['illust'].y = i;
                },
                j;
            }
            (),
            C = function (C) {
                function i() {
                    var w = C.call(this, new ui['lobby']['susheUI']()) || this;
                    return w['contianer_illust'] = null,
                    w['illust'] = null,
                    w['illust_rect'] = null,
                    w['container_name'] = null,
                    w['label_name'] = null,
                    w['label_cv'] = null,
                    w['label_cv_title'] = null,
                    w['container_page'] = null,
                    w['container_look_illust'] = null,
                    w['page_select_character'] = null,
                    w['page_visit_character'] = null,
                    w['origin_illust_x'] = 0,
                    w['chat_id'] = 0,
                    w['container_chat'] = null,
                    w['_select_index'] = 0,
                    w['sound_channel'] = null,
                    w['chat_block'] = null,
                    w['illust_showing'] = !0,
                    i.Inst = w,
                    w;
                }
                return __extends(i, C),
                i['onMainSkinChange'] = function () {
                    var w = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                    w && w['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](w.path) + '/spine');
                },
                i['randomDesktopID'] = function () {
                    var j = w['UI_Sushe']['commonViewList'][w['UI_Sushe']['using_commonview_index']];
                    if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), j)
                        for (var C = 0; C < j['length']; C++)
                            j[C].slot == game['EView'].mjp ? this['now_mjp_id'] = j[C].type ? j[C]['item_id_list'][Math['floor'](Math['random']() * j[C]['item_id_list']['length'])] : j[C]['item_id'] : j[C].slot == game['EView']['desktop'] && (this['now_desktop_id'] = j[C].type ? j[C]['item_id_list'][Math['floor'](Math['random']() * j[C]['item_id_list']['length'])] : j[C]['item_id']);
                },
                i.init = function (j) {
                    var C = this;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (l, u) {
                        if (l || u['error'])
                            w['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', l, u);
                        else {
                            if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](u)), u = JSON['parse'](JSON['stringify'](u)), u['main_character_id'] && u['characters']) {
                                //if (C['characters'] = [], u['characters'])
                                //    for (var b = 0; b < u['characters']['length']; b++)
                                //        C['characters'].push(u['characters'][b]);
                                //if (C['skin_map'] = {}, u['skins'])
                                //    for (var b = 0; b < u['skins']['length']; b++)
                                //        C['skin_map'][u['skins'][b]] = 1;
                                //C['main_character_id'] = u['main_character_id'];
                                                //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                                fake_data.char_id = u.main_character_id;
                                                for (let i = 0; i < u.characters.length; i++) {
                                                    if (u.characters[i].charid == u.main_character_id) {
                                                        if (u.characters[i].extra_emoji !== undefined) {
                                                            fake_data.emoji = u.characters[i].extra_emoji;
                                                        } else {
                                                            fake_data.emoji = [];
                                                        }
                                                        fake_data.skin = u.skins[i];
                                                        fake_data.exp = u.characters[i].exp;
                                                        fake_data.level = u.characters[i].level;
                                                        fake_data.is_upgraded = u.characters[i].is_upgraded;
                                                        break;
                                                    }
                                                }
                                                C.characters = [];
        
                                                for (let j = 1; j <= cfg.item_definition.character['rows_'].length; j++) {
                                                    let id = 200000 + j;
                                                    let skin = 400001 + j * 100;
                                                    let emoji = [];
                                                    cfg.character.emoji.getGroup(id).forEach((element) => {
                                                        emoji.push(element.sub_id);
                                                    });
                                                    C.characters.push({
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
                                                C.main_character_id = MMP.settings.character;
                                                GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                                uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                                C.star_chars = MMP.settings.star_chars;
                                                u.character_sort = MMP.settings.star_chars;
                                                // END
                            } else
                                C['characters'] = [], C['characters'].push({
                                    charid: '200001',
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: '400101',
                                    is_upgraded: !1,
                                    extra_emoji: [],
                                    rewarded_level: []
                                }), C['characters'].push({
                                    charid: '200002',
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: '400201',
                                    is_upgraded: !1,
                                    extra_emoji: [],
                                    rewarded_level: []
                                }), C['skin_map']['400101'] = 1, C['skin_map']['400201'] = 1, C['main_character_id'] = '200001';
                            if (C['send_gift_count'] = 0, C['send_gift_limit'] = 0, u['send_gift_count'] && (C['send_gift_count'] = u['send_gift_count']), u['send_gift_limit'] && (C['send_gift_limit'] = u['send_gift_limit']), u['finished_endings'])
                                for (var b = 0; b < u['finished_endings']['length']; b++)
                                    C['finished_endings_map'][u['finished_endings'][b]] = 1;
                            if (u['rewarded_endings'])
                                for (var b = 0; b < u['rewarded_endings']['length']; b++)
                                    C['rewarded_endings_map'][u['rewarded_endings'][b]] = 1;
                            if (C['star_chars'] = [], u['character_sort'] && (C['star_chars'] = u['character_sort']), i['hidden_characters_map'] = {}, u['hidden_characters'])
                                for (var V = 0, k = u['hidden_characters']; V < k['length']; V++) {
                                    var S = k[V];
                                    i['hidden_characters_map'][S] = 1;
                                }
                            j.run();
                        }
                    }),
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (j, i) {
                    //    if (j || i['error'])
                    //        w['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', j, i);
                    //    else {
                    //        C['using_commonview_index'] = i.use,
                    //        C['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                    //        var l = i['views'];
                    //        if (l)
                    //            for (var u = 0; u < l['length']; u++) {
                    //                var b = l[u]['values'];
                    //                b && (C['commonViewList'][l[u]['index']] = b);
                    //            }
                    //        C['randomDesktopID'](),
                                        C.commonViewList = MMP.settings.commonViewList;
                                    C.using_commonview_index = MMP.settings.using_commonview_index;
                                    GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view'](),
                            GameMgr.Inst['load_touming_mjp_view']();
                                    GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                                    uiscript.UI_Sushe.randomDesktopID();
                    //    }
                    //});
                },
                i['on_data_updata'] = function (j) {
                    if (j['character']) {
                        var C = JSON['parse'](JSON['stringify'](j['character']));
                        if (C['characters'])
                            for (var i = C['characters'], l = 0; l < i['length']; l++) {
                                for (var u = !1, b = 0; b < this['characters']['length']; b++)
                                    if (this['characters'][b]['charid'] == i[l]['charid']) {
                                        this['characters'][b] = i[l],
                                        w['UI_Sushe_Visit'].Inst && w['UI_Sushe_Visit'].Inst['chara_info'] && w['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][b]['charid'] && (w['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][b]),
                                        u = !0;
                                        break;
                                    }
                                u || this['characters'].push(i[l]);
                            }
                        if (C['skins']){
                            for (var V = C['skins'], l = 0; l < V['length']; l++)
                                this['skin_map'][V[l]] = 1;
         // START
          k['UI_Bag'].Inst['on_skin_change']();
         // END
         }
                        if (C['finished_endings']) {
                            for (var k = C['finished_endings'], l = 0; l < k['length']; l++)
                                this['finished_endings_map'][k[l]] = 1;
                            w['UI_Sushe_Visit'].Inst;
                        }
                        if (C['rewarded_endings']) {
                            for (var k = C['rewarded_endings'], l = 0; l < k['length']; l++)
                                this['rewarded_endings_map'][k[l]] = 1;
                            w['UI_Sushe_Visit'].Inst;
                        }
                    }
                },
                i['chara_owned'] = function (w) {
                    for (var j = 0; j < this['characters']['length']; j++)
                        if (this['characters'][j]['charid'] == w)
                            return !0;
                    return !1;
                },
                i['skin_owned'] = function (w) {
                    return this['skin_map']['hasOwnProperty'](w['toString']());
                },
                i['add_skin'] = function (w) {
                    this['skin_map'][w] = 1;
                },
                Object['defineProperty'](i, 'main_chara_info', {
                    get: function () {
                        for (var w = 0; w < this['characters']['length']; w++)
                            if (this['characters'][w]['charid'] == this['main_character_id'])
                                return this['characters'][w];
                        return null;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                i['on_view_remove'] = function (w) {
                    for (var j = 0; j < this['commonViewList']['length']; j++)
                        for (var C = this['commonViewList'][j], i = 0; i < C['length']; i++)
                            if (C[i]['item_id'] == w && (C[i]['item_id'] = game['GameUtility']['get_view_default_item_id'](C[i].slot)), C[i]['item_id_list']) {
                                for (var l = 0; l < C[i]['item_id_list']['length']; l++)
                                    if (C[i]['item_id_list'][l] == w) {
                                        C[i]['item_id_list']['splice'](l, 1);
                                        break;
                                    }
                                0 == C[i]['item_id_list']['length'] && (C[i].type = 0);
                            }
                    var u = cfg['item_definition'].item.get(w);
                    u.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == w && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                },
                i['add_finish_ending'] = function (w) {
                    this['finished_endings_map'][w] = 1;
                },
                i['add_reward_ending'] = function (w) {
                    this['rewarded_endings_map'][w] = 1;
                },
                i['check_all_char_repoint'] = function () {
                    for (var w = 0; w < i['characters']['length']; w++)
                        if (this['check_char_redpoint'](i['characters'][w]))
                            return !0;
                    return !1;
                },
                i['check_char_redpoint'] = function (w) {
                                    // 去除小红点
                    //if (i['hidden_characters_map'][w['charid']])
                        return !1;
                                    //END
                    var j = cfg.spot.spot['getGroup'](w['charid']);
                    if (j)
                        for (var C = 0; C < j['length']; C++) {
                            var l = j[C];
                            if (!(l['is_married'] && !w['is_upgraded'] || !l['is_married'] && w['level'] < l['level_limit']) && 2 == l.type) {
                                for (var u = !0, b = 0; b < l['jieju']['length']; b++)
                                    if (l['jieju'][b] && i['finished_endings_map'][l['jieju'][b]]) {
                                        if (!i['rewarded_endings_map'][l['jieju'][b]])
                                            return !0;
                                        u = !1;
                                    }
                                if (u)
                                    return !0;
                            }
                        }
                    return !1;
                },
                i['is_char_star'] = function (w) {
                    return -1 != this['star_chars']['indexOf'](w);
                },
                i['change_char_star'] = function (w) {
                    var j = this['star_chars']['indexOf'](w);
                    -1 != j ? this['star_chars']['splice'](j, 1) : this['star_chars'].push(w);
                                    // 屏蔽网络请求
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                    //    sort: this['star_chars']
                    //}, function () {});
                                    // END
                },
                Object['defineProperty'](i['prototype'], 'select_index', {
                    get: function () {
                        return this['_select_index'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                i['prototype']['reset_select_index'] = function () {
                    this['_select_index'] = -1;
                },
                i['prototype']['onCreate'] = function () {
                    var C = this;
                    this['contianer_illust'] = this.me['getChildByName']('illust'),
                    this['illust'] = new w['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                    this['illust']['setType']('liaoshe'),
                    this['illust_rect'] = w['UIRect']['CreateFromSprite'](this['illust'].me),
                    this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                    this['chat_block'] = new w['UI_Character_Chat'](this['container_chat'], !0),
                    this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            if (!C['page_visit_character'].me['visible'] || !C['page_visit_character']['cannot_click_say'])
                                if (C['illust']['onClick'](), C['sound_channel'])
                                    C['stopsay']();
                                else {
                                    if (!C['illust_showing'])
                                        return;
                                    C.say('lobby_normal');
                                }
                        }, null, !1),
                    this['container_name'] = null,
                    'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title')) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                    this['label_name'] = this['container_name']['getChildByName']('label_name'),
                    this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                    this['origin_illust_x'] = this['contianer_illust'].x,
                    this['container_page'] = this.me['getChildByName']('container_page'),
                    this['page_select_character'] = new w['UI_Sushe_Select'](),
                    this['container_page']['addChild'](this['page_select_character'].me),
                    this['page_visit_character'] = new w['UI_Sushe_Visit'](),
                    this['container_page']['addChild'](this['page_visit_character'].me),
                    this['container_look_illust'] = new j(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                },
                i['prototype'].show = function (j) {
                    w['UI_Activity_SevenDays']['task_done'](1),
                    GameMgr.Inst['BehavioralStatistics'](15),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                    this['enable'] = !0,
                    this['page_visit_character'].me['visible'] = !1,
                    this['container_look_illust'].me['visible'] = !1;
                    for (var C = 0, l = 0; l < i['characters']['length']; l++)
                        if (i['characters'][l]['charid'] == i['main_character_id']) {
                            C = l;
                            break;
                        }
                    0 == j ? (this['change_select'](C), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                },
                i['prototype']['starup_back'] = function () {
                    this['enable'] = !0,
                    this['change_select'](this['_select_index']),
                    this['page_visit_character']['star_up_back'](i['characters'][this['_select_index']]),
                    this['page_visit_character']['show_levelup']();
                },
                i['prototype']['spot_back'] = function () {
                    this['enable'] = !0,
                    this['change_select'](this['_select_index']),
                    this['page_visit_character'].show(i['characters'][this['_select_index']], 2);
                },
                i['prototype']['go2Lobby'] = function () {
                    this['close'](Laya['Handler']['create'](this, function () {
                            w['UIMgr'].Inst['showLobby']();
                        }));
                },
                i['prototype']['close'] = function (j) {
                    var C = this;
                    this['illust_showing'] && w['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                        x: -30
                    }, 150, 0),
                    Laya['timer'].once(150, this, function () {
                        C['enable'] = !1,
                        j && j.run();
                    });
                },
                i['prototype']['onDisable'] = function () {
                    view['AudioMgr']['refresh_music_volume'](!1),
                    this['illust']['clear'](),
                    this['stopsay'](),
                    this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                },
                i['prototype']['hide_illust'] = function () {
                    var j = this;
                    this['illust_showing'] && (this['illust_showing'] = !1, w['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                            x: -30
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                j['contianer_illust']['visible'] = !1;
                            })));
                },
                i['prototype']['open_illust'] = function () {
                    if (!this['illust_showing'])
                        if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                            this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, w['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                x: -30
                            }, 200);
                        else {
                            for (var j = 0, C = 0; C < i['characters']['length']; C++)
                                if (i['characters'][C]['charid'] == i['main_character_id']) {
                                    j = C;
                                    break;
                                }
                            this['change_select'](j);
                        }
                },
                i['prototype']['show_page_select'] = function () {
                    this['page_select_character'].show(0);
                },
                i['prototype']['show_page_visit'] = function (w) {
                    void 0 === w && (w = 0),
                    this['page_visit_character'].show(i['characters'][this['_select_index']], w);
                },
                i['prototype']['change_select'] = function (j) {
                    this['_select_index'] = j,
                    this['illust']['clear'](),
                    this['illust_showing'] = !0;
                    var C = i['characters'][j],
                    l = cfg['item_definition']['character'].get(C['charid']);
                    if ('chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != i['chs_fengyu_name_lst']['indexOf'](C['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != i['chs_fengyu_cv_lst']['indexOf'](C['charid']) ? 'fengyu' : 'hanyi'), 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                        this['label_name'].text = l['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'),
                        this['label_cv'].text = l['desc_cv_' + GameMgr['client_language']],
                        this['label_cv_title'].text = 'CV';
                        var u = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F·]*$/;
                        this['label_name']['leading'] = this['label_name']['textField']['textHeight'] > 320 ? -5 : u.test(l['name_' + GameMgr['client_language']]) ? -15 : 0,
                        this['label_cv']['leading'] = u.test(this['label_cv'].text) ? -7 : 0;
                    } else
                        this['label_name'].text = l['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + l['desc_cv_' + GameMgr['client_language']];
                    ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && (this['label_cv']['height'] = 600, this['label_cv_title'].y = 350 - this['label_cv']['textField']['textHeight'] / 2 * 0.7);
                    var b = new w['UIRect']();
                    b.x = this['illust_rect'].x,
                    b.y = this['illust_rect'].y,
                    b['width'] = this['illust_rect']['width'],
                    b['height'] = this['illust_rect']['height'],
                    this['illust']['setRect'](b),
                    this['illust']['setSkin'](C.skin, 'full'),
                    this['contianer_illust']['visible'] = !0,
                    Laya['Tween']['clearAll'](this['contianer_illust']),
                    this['contianer_illust'].x = this['origin_illust_x'],
                    this['contianer_illust']['alpha'] = 1,
                    w['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                        x: -30
                    }, 230),
                    this['stopsay']();
                    var V = cfg['item_definition'].skin.get(C.skin);
                    V['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                },
                i['prototype']['onChangeSkin'] = function (w) {
                    i['characters'][this['_select_index']].skin = w,
                    this['change_select'](this['_select_index']),
                    i['characters'][this['_select_index']]['charid'] == i['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = w, i['onMainSkinChange']());
                                    // 屏蔽换肤请求
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                    //    character_id: i['characters'][this['_select_index']]['charid'],
                    //    skin: w
                    //}, function () {});
                                    // 保存皮肤
                },
                i['prototype'].say = function (w) {
                    var j = this,
                    C = i['characters'][this['_select_index']];
                    this['chat_id']++;
                    var l = this['chat_id'],
                    u = view['AudioMgr']['PlayCharactorSound'](C, w, Laya['Handler']['create'](this, function () {
                                Laya['timer'].once(1000, j, function () {
                                    l == j['chat_id'] && j['stopsay']();
                                });
                            }));
                    u && (this['chat_block'].show(u['words']), this['sound_channel'] = u['sound']);
                },
                i['prototype']['stopsay'] = function () {
                    this['chat_block']['close'](!1),
                    this['sound_channel'] && (this['sound_channel'].stop(), Laya['SoundManager']['removeChannel'](this['sound_channel']), this['sound_channel'] = null);
                },
                i['prototype']['to_look_illust'] = function () {
                    var w = this;
                    this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                            w['illust']['playAnim']('idle'),
                            w['page_select_character'].show(0);
                        }));
                },
                i['prototype']['jump_to_char_skin'] = function (j, C) {
                    var l = this;
                    if (void 0 === j && (j = -1), void 0 === C && (C = null), j >= 0)
                        for (var u = 0; u < i['characters']['length']; u++)
                            if (i['characters'][u]['charid'] == j) {
                                this['change_select'](u);
                                break;
                            }
                    w['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                            i.Inst['show_page_visit'](),
                            l['page_visit_character']['show_pop_skin'](),
                            l['page_visit_character']['set_jump_callback'](C);
                        }));
                },
                i['prototype']['jump_to_char_qiyue'] = function (j) {
                    var C = this;
                    if (void 0 === j && (j = -1), j >= 0)
                        for (var l = 0; l < i['characters']['length']; l++)
                            if (i['characters'][l]['charid'] == j) {
                                this['change_select'](l);
                                break;
                            }
                    w['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                            i.Inst['show_page_visit'](),
                            C['page_visit_character']['show_qiyue']();
                        }));
                },
                i['prototype']['jump_to_char_gift'] = function (j) {
                    var C = this;
                    if (void 0 === j && (j = -1), j >= 0)
                        for (var l = 0; l < i['characters']['length']; l++)
                            if (i['characters'][l]['charid'] == j) {
                                this['change_select'](l);
                                break;
                            }
                    w['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                            i.Inst['show_page_visit'](),
                            C['page_visit_character']['show_gift']();
                        }));
                },
                i['characters'] = [],
                i['chs_fengyu_name_lst'] = ['200040', '200043'],
                i['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                i['skin_map'] = {},
                i['main_character_id'] = 0,
                i['send_gift_count'] = 0,
                i['send_gift_limit'] = 0,
                i['commonViewList'] = [],
                i['using_commonview_index'] = 0,
                i['finished_endings_map'] = {},
                i['rewarded_endings_map'] = {},
                i['star_chars'] = [],
                i['hidden_characters_map'] = {},
                i.Inst = null,
                i;
            }
            (w['UIBase']);
            w['UI_Sushe'] = C;
        }
        (uiscript || (uiscript = {}));
        







        // 屏蔽改变宿舍角色的网络请求
        !function (w) {
            var j = function () {
                function j(j) {
                    var i = this;
                    this['scrollview'] = null,
                    this['select_index'] = 0,
                    this['show_index_list'] = [],
                    this['only_show_star_char'] = !1,
                    this.me = j,
                    this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C.Inst['locking'] || C.Inst['close'](Laya['Handler']['create'](i, function () {
                                    w['UI_Sushe'].Inst['show_page_visit']();
                                }));
                        }, null, !1),
                    this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C.Inst['locking'] || C.Inst['close'](Laya['Handler']['create'](i, function () {
                                    w['UI_Sushe'].Inst['to_look_illust']();
                                }));
                        }, null, !1),
                    this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C.Inst['locking'] || w['UI_Sushe'].Inst['jump_to_char_skin']();
                        }, null, !1),
                    this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C.Inst['locking'] || i['onChangeStarShowBtnClick']();
                        }, null, !1),
                    this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                    this['scrollview']['setElastic'](),
                    this['dongtai_kaiguan'] = new w['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                                w['UI_Sushe'].Inst['illust']['resetSkin']();
                            }));
                }
                return j['prototype'].show = function (j, C) {
                    if (void 0 === C && (C = !1), this.me['visible'] = !0, j ? this.me['alpha'] = 1 : w['UIBase']['anim_alpha_in'](this.me, {
                                x: 0
                            }, 200, 0), this['getShowStarState'](), this['sortShowCharsList'](), C || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47), this['scrollview']['reset'](), this['scrollview']['addItem'](this['show_index_list']['length']), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var i = (Math['floor'](this['select_index'] / 3) - 1) / (Math.ceil(this['show_index_list']['length'] / 3) - 2.5);
                        this['scrollview'].rate = Math.min(1, Math.max(0, i));
                    }
                },
                j['prototype']['render_character_cell'] = function (j) {
                    var C = this,
                    i = j['index'],
                    l = j['container'],
                    u = j['cache_data'];
                    l['visible'] = !0,
                    u['index'] = i,
                    u['inited'] || (u['inited'] = !0, l['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                C['onClickAtHead'](u['index']);
                            }), u.skin = new w['UI_Character_Skin'](l['getChildByName']('btn')['getChildByName']('head')), u.bg = l['getChildByName']('btn')['getChildByName']('bg'), u['bound'] = l['getChildByName']('btn')['getChildByName']('bound'), u['btn_star'] = l['getChildByName']('btn_star'), u.star = l['getChildByName']('btn')['getChildByName']('star'), u['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                                C['onClickAtStar'](u['index']);
                            }));
                    var b = l['getChildByName']('btn');
                    b['getChildByName']('choose')['visible'] = i == this['select_index'];
                    var V = this['getCharInfoByIndex'](i);
                    b['getChildByName']('redpoint')['visible'] = w['UI_Sushe']['check_char_redpoint'](V),
                    u.skin['setSkin'](V.skin, 'bighead'),
                    b['getChildByName']('using')['visible'] = V['charid'] == w['UI_Sushe']['main_character_id'],
                    l['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (V['is_upgraded'] ? '2.png' : '.png'));
                    var k = cfg['item_definition']['character'].get(V['charid']);
                    'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? u['bound'].skin = k.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (V['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (V['is_upgraded'] ? '2.png' : '.png')) : k.ur ? (u['bound'].pos(-10, -2), u['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (V['is_upgraded'] ? '6.png' : '5.png'))) : (u['bound'].pos(4, 20), u['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (V['is_upgraded'] ? '4.png' : '3.png'))),
                    u['btn_star']['visible'] = this['select_index'] == i,
                    u.star['visible'] = w['UI_Sushe']['is_char_star'](V['charid']) || this['select_index'] == i;
                    var S = cfg['item_definition']['character'].find(V['charid']),
                    H = b['getChildByName']('label_name'),
                    N = S['name_' + GameMgr['client_language'] + '2'] ? S['name_' + GameMgr['client_language'] + '2'] : S['name_' + GameMgr['client_language']];
                    if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                        u.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (w['UI_Sushe']['is_char_star'](V['charid']) ? 'l' : 'd') + (V['is_upgraded'] ? '1.png' : '.png')),
                        H.text = N['replace']('-', '|')['replace'](/\./g, '·');
                        var W = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                        H['leading'] = W.test(N) ? -15 : 0;
                    } else
                        u.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (w['UI_Sushe']['is_char_star'](V['charid']) ? 'l.png' : 'd.png')), H.text = N;
                    ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == V['charid'] ? (H['scaleX'] = 0.67, H['scaleY'] = 0.57) : (H['scaleX'] = 0.7, H['scaleY'] = 0.6));
                },
                j['prototype']['onClickAtHead'] = function (j) {
                    if (this['select_index'] == j) {
                        var C = this['getCharInfoByIndex'](j);
                        if (C['charid'] != w['UI_Sushe']['main_character_id'])
                            if (w['UI_PiPeiYuYue'].Inst['enable'])
                                w['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                            else {
                                var i = w['UI_Sushe']['main_character_id'];
                                w['UI_Sushe']['main_character_id'] = C['charid'],
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                //    character_id: w['UI_Sushe']['main_character_id']
                                //}, function () {}),
                                GameMgr.Inst['account_data']['avatar_id'] = C.skin,
                                w['UI_Sushe']['onMainSkinChange']();
                                            // 保存人物和皮肤
                                            MMP.settings.character = C.charid;
                                            MMP.settings.characters[MMP.settings.character - 200001] = C.skin;
                                            MMP.saveSettings();
                                            // END
                                for (var l = 0; l < this['show_index_list']['length']; l++)
                                    this['getCharInfoByIndex'](l)['charid'] == i && this['scrollview']['wantToRefreshItem'](l);
                                this['scrollview']['wantToRefreshItem'](j);
                            }
                    } else {
                        var u = this['select_index'];
                        this['select_index'] = j,
                        u >= 0 && this['scrollview']['wantToRefreshItem'](u),
                        this['scrollview']['wantToRefreshItem'](j),
                        w['UI_Sushe'].Inst['change_select'](this['show_index_list'][j]);
                    }
                },
                j['prototype']['onClickAtStar'] = function (j) {
                    if (w['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](j)['charid']), this['only_show_star_char'])
                        this['scrollview']['wantToRefreshItem'](j);
                    else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var C = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                        this['scrollview'].rate = Math.min(1, Math.max(0, C));
                    }
                                // 保存人物和皮肤
                                MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                                MMP.saveSettings();
                                // END
                },
                j['prototype']['close'] = function (j) {
                    var C = this;
                    this.me['visible'] && (j ? this.me['visible'] = !1 : w['UIBase']['anim_alpha_out'](this.me, {
                                x: 0
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                    C.me['visible'] = !1;
                                })));
                },
                j['prototype']['onChangeStarShowBtnClick'] = function () {
                    if (!this['only_show_star_char']) {
                        for (var j = !1, C = 0, i = w['UI_Sushe']['star_chars']; C < i['length']; C++) {
                            var l = i[C];
                            if (!w['UI_Sushe']['hidden_characters_map'][l]) {
                                j = !0;
                                break;
                            }
                        }
                        if (!j)
                            return w['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                    }
                    w['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                    this['only_show_star_char'] = !this['only_show_star_char'],
                    app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                    var u = this.me['getChildByName']('btn_star')['getChildAt'](1);
                    Laya['Tween']['clearAll'](u),
                    Laya['Tween'].to(u, {
                        x: this['only_show_star_char'] ? 107 : 47
                    }, 150),
                    this.show(!0, !0);
                },
                j['prototype']['getShowStarState'] = function () {
                    if (0 == w['UI_Sushe']['star_chars']['length'])
                        return this['only_show_star_char'] = !1, void 0;
                    if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                        for (var j = 0, C = w['UI_Sushe']['star_chars']; j < C['length']; j++) {
                            var i = C[j];
                            if (!w['UI_Sushe']['hidden_characters_map'][i])
                                return;
                        }
                        this['only_show_star_char'] = !1,
                        app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                    }
                },
                j['prototype']['sortShowCharsList'] = function () {
                    this['show_index_list'] = [],
                    this['select_index'] = -1;
                    for (var j = 0, C = w['UI_Sushe']['star_chars']; j < C['length']; j++) {
                        var i = C[j];
                        if (!w['UI_Sushe']['hidden_characters_map'][i])
                            for (var l = 0; l < w['UI_Sushe']['characters']['length']; l++)
                                if (w['UI_Sushe']['characters'][l]['charid'] == i) {
                                    l == w['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                    this['show_index_list'].push(l);
                                    break;
                                }
                    }
                    if (!this['only_show_star_char'])
                        for (var l = 0; l < w['UI_Sushe']['characters']['length']; l++)
                            w['UI_Sushe']['hidden_characters_map'][w['UI_Sushe']['characters'][l]['charid']] || -1 == this['show_index_list']['indexOf'](l) && (l == w['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(l));
                },
                j['prototype']['getCharInfoByIndex'] = function (j) {
                    return w['UI_Sushe']['characters'][this['show_index_list'][j]];
                },
                j;
            }
            (),
            C = function (C) {
                function i() {
                    var w = C.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                    return w['bg_width_head'] = 962,
                    w['bg_width_zhuangban'] = 1819,
                    w['bg2_delta'] = -29,
                    w['container_top'] = null,
                    w['locking'] = !1,
                    w.tabs = [],
                    w['tab_index'] = 0,
                    i.Inst = w,
                    w;
                }
                return __extends(i, C),
                i['prototype']['onCreate'] = function () {
                    var C = this;
                    this['container_top'] = this.me['getChildByName']('top'),
                    this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C['locking'] || (1 == C['tab_index'] && C['container_zhuangban']['changed'] ? w['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](C, function () {
                                        C['close'](),
                                        w['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (C['close'](), w['UI_Sushe'].Inst['go2Lobby']()));
                        }, null, !1),
                    this.root = this.me['getChildByName']('root'),
                    this.bg2 = this.root['getChildByName']('bg2'),
                    this.bg = this.root['getChildByName']('bg');
                    for (var i = this.root['getChildByName']('container_tabs'), l = function (j) {
                        u.tabs.push(i['getChildAt'](j)),
                        u.tabs[j]['clickHandler'] = new Laya['Handler'](u, function () {
                                C['locking'] || C['tab_index'] != j && (1 == C['tab_index'] && C['container_zhuangban']['changed'] ? w['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](C, function () {
                                            C['change_tab'](j);
                                        }), null) : C['change_tab'](j));
                            });
                    }, u = this, b = 0; b < i['numChildren']; b++)
                        l(b);
                    this['container_head'] = new j(this.root['getChildByName']('container_heads')),
                    this['container_zhuangban'] = new w['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return C['locking'];
                            }));
                },
                i['prototype'].show = function (j) {
                    var C = this;
                    this['enable'] = !0,
                    this['locking'] = !0,
                    this['container_head']['dongtai_kaiguan']['refresh'](),
                    this['tab_index'] = j,
                    this['container_top'].y = 48,
                    0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), w['UIBase']['anim_alpha_in'](this['container_top'], {
                            y: -30
                        }, 200), w['UIBase']['anim_alpha_in'](this.root, {
                            x: 30
                        }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), w['UIBase']['anim_alpha_in'](this['container_top'], {
                            y: -30
                        }, 200), w['UIBase']['anim_alpha_in'](this.root, {
                            y: 30
                        }, 200)),
                    Laya['timer'].once(200, this, function () {
                        C['locking'] = !1;
                    });
                    for (var i = 0; i < this.tabs['length']; i++) {
                        var l = this.tabs[i];
                        l.skin = game['Tools']['localUISrc'](i == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var u = l['getChildByName']('word');
                        u['color'] = i == this['tab_index'] ? '#552c1c' : '#d3a86c',
                        u['scaleX'] = u['scaleY'] = i == this['tab_index'] ? 1.1 : 1,
                        i == this['tab_index'] && l['parent']['setChildIndex'](l, this.tabs['length'] - 1);
                    }
                },
                i['prototype']['change_tab'] = function (j) {
                    var C = this;
                    this['tab_index'] = j;
                    for (var i = 0; i < this.tabs['length']; i++) {
                        var l = this.tabs[i];
                        l.skin = game['Tools']['localUISrc'](i == j ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var u = l['getChildByName']('word');
                        u['color'] = i == j ? '#552c1c' : '#d3a86c',
                        u['scaleX'] = u['scaleY'] = i == j ? 1.1 : 1,
                        i == j && l['parent']['setChildIndex'](l, this.tabs['length'] - 1);
                    }
                    this['locking'] = !0,
                    0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                            width: this['bg_width_head']
                        }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                w['UI_Sushe'].Inst['open_illust'](),
                                C['container_head'].show(!1);
                            })), Laya['Tween'].to(this.bg2, {
                            width: this['bg_width_head'] + this['bg2_delta']
                        }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), w['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                            width: this['bg_width_zhuangban']
                        }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                C['container_zhuangban'].show(!1);
                            })), Laya['Tween'].to(this.bg2, {
                            width: this['bg_width_zhuangban'] + this['bg2_delta']
                        }, 200, Laya.Ease['strongOut'])),
                    Laya['timer'].once(400, this, function () {
                        C['locking'] = !1;
                    });
                },
                i['prototype']['close'] = function (j) {
                    var C = this;
                    this['locking'] = !0,
                    w['UIBase']['anim_alpha_out'](this['container_top'], {
                        y: -30
                    }, 150),
                    0 == this['tab_index'] ? w['UIBase']['anim_alpha_out'](this.root, {
                        x: 30
                    }, 150, 0, Laya['Handler']['create'](this, function () {
                            C['container_head']['close'](!0);
                        })) : w['UIBase']['anim_alpha_out'](this.root, {
                        y: 30
                    }, 150, 0, Laya['Handler']['create'](this, function () {
                            C['container_zhuangban']['close'](!0);
                        })),
                    Laya['timer'].once(150, this, function () {
                        C['locking'] = !1,
                        C['enable'] = !1,
                        j && j.run();
                    });
                },
                i['prototype']['onDisable'] = function () {
                    for (var j = 0; j < w['UI_Sushe']['characters']['length']; j++) {
                        var C = w['UI_Sushe']['characters'][j].skin,
                        i = cfg['item_definition'].skin.get(C);
                        i && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](i.path + '/bighead.png'));
                    }
                },
                i['prototype']['changeKaiguanShow'] = function (w) {
                    w ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                },
                i['prototype']['changeZhuangbanSlot'] = function (w) {
                    this['container_zhuangban']['changeSlotByItemId'](w);
                },
                i;
            }
            (w['UIBase']);
            w['UI_Sushe_Select'] = C;
        }
        (uiscript || (uiscript = {}));
        





        // 友人房
        !function (w) {
            var j = function () {
                function j(w) {
                    var j = this;
                    this['friends'] = [],
                    this['sortlist'] = [],
                    this.me = w,
                    this.me['visible'] = !1,
                    this['blackbg'] = w['getChildByName']('blackbg'),
                    this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['locking'] || j['close']();
                        }, null, !1),
                    this.root = w['getChildByName']('root'),
                    this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                    this['noinfo'] = this.root['getChildByName']('noinfo');
                }
                return j['prototype'].show = function () {
                    var j = this;
                    this['locking'] = !0,
                    this.me['visible'] = !0,
                    this['scrollview']['reset'](),
                    this['friends'] = [],
                    this['sortlist'] = [];
                    for (var C = game['FriendMgr']['friend_list'], i = 0; i < C['length']; i++)
                        this['sortlist'].push(i);
                    this['sortlist'] = this['sortlist'].sort(function (w, j) {
                            var i = C[w],
                            l = 0;
                            if (i['state']['is_online']) {
                                var u = game['Tools']['playState2Desc'](i['state']['playing']);
                                l += '' != u ? 30000000000 : 60000000000,
                                i.base['level'] && (l += i.base['level'].id % 1000 * 10000000),
                                i.base['level3'] && (l += i.base['level3'].id % 1000 * 10000),
                                l += -Math['floor'](i['state']['login_time'] / 10000000);
                            } else
                                l += i['state']['logout_time'];
                            var b = C[j],
                            V = 0;
                            if (b['state']['is_online']) {
                                var u = game['Tools']['playState2Desc'](b['state']['playing']);
                                V += '' != u ? 30000000000 : 60000000000,
                                b.base['level'] && (V += b.base['level'].id % 1000 * 10000000),
                                b.base['level3'] && (V += b.base['level3'].id % 1000 * 10000),
                                V += -Math['floor'](b['state']['login_time'] / 10000000);
                            } else
                                V += b['state']['logout_time'];
                            return V - l;
                        });
                    for (var i = 0; i < C['length']; i++)
                        this['friends'].push({
                            f: C[i],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                    this['scrollview']['addItem'](this['friends']['length']),
                    w['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            j['locking'] = !1;
                        }));
                },
                j['prototype']['close'] = function () {
                    var j = this;
                    this['locking'] = !0,
                    w['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            j['locking'] = !1,
                            j.me['visible'] = !1;
                        }));
                },
                j['prototype']['render_item'] = function (j) {
                    var C = j['index'],
                    i = j['container'],
                    u = j['cache_data'];
                    u.head || (u.head = new w['UI_Head'](i['getChildByName']('head'), 'UI_WaitingRoom'), u.name = i['getChildByName']('name'), u['state'] = i['getChildByName']('label_state'), u.btn = i['getChildByName']('btn_invite'), u['invited'] = i['getChildByName']('invited'));
                    var b = this['friends'][this['sortlist'][C]];
                    u.head.id = game['GameUtility']['get_limited_skin_id'](b.f.base['avatar_id']),
                    u.head['set_head_frame'](b.f.base['account_id'], b.f.base['avatar_frame']),
                    game['Tools']['SetNickname'](u.name, b.f.base);
                    var V = !1;
                    if (b.f['state']['is_online']) {
                        var k = game['Tools']['playState2Desc'](b.f['state']['playing']);
                        '' != k ? (u['state'].text = game['Tools']['strOfLocalization'](2069, [k]), u['state']['color'] = '#a9d94d', u.name['getChildByName']('name')['color'] = '#a9d94d') : (u['state'].text = game['Tools']['strOfLocalization'](2071), u['state']['color'] = '#58c4db', u.name['getChildByName']('name')['color'] = '#58c4db', V = !0);
                    } else
                        u['state'].text = game['Tools']['strOfLocalization'](2072), u['state']['color'] = '#8c8c8c', u.name['getChildByName']('name')['color'] = '#8c8c8c';
                    b['invited'] ? (u.btn['visible'] = !1, u['invited']['visible'] = !0) : (u.btn['visible'] = !0, u['invited']['visible'] = !1, game['Tools']['setGrayDisable'](u.btn, !V), V && (u.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    game['Tools']['setGrayDisable'](u.btn, !0);
                                    var j = {
                                        room_id: l.Inst['room_id'],
                                        mode: l.Inst['room_mode'],
                                        nickname: GameMgr.Inst['account_data']['nickname'],
                                        verified: GameMgr.Inst['account_data']['verified'],
                                        account_id: GameMgr.Inst['account_id']
                                    };
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                        target_id: b.f.base['account_id'],
                                        type: game['EFriendMsgType']['room_invite'],
                                        content: JSON['stringify'](j)
                                    }, function (j, C) {
                                        j || C['error'] ? (game['Tools']['setGrayDisable'](u.btn, !1), w['UIMgr'].Inst['showNetReqError']('sendClientMessage', j, C)) : (u.btn['visible'] = !1, u['invited']['visible'] = !0, b['invited'] = !0);
                                    });
                                }, null, !1)));
                },
                j;
            }
            (),
            C = function () {
                function j(j) {
                    var C = this;
                    this.tabs = [],
                    this['tab_index'] = 0,
                    this.me = j,
                    this['blackmask'] = this.me['getChildByName']('blackmask'),
                    this.root = this.me['getChildByName']('root'),
                    this['page_head'] = new w['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                    this['page_zhangban'] = new w['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return C['locking'];
                            }));
                    for (var i = this.root['getChildByName']('container_tabs'), l = function (j) {
                        u.tabs.push(i['getChildAt'](j)),
                        u.tabs[j]['clickHandler'] = new Laya['Handler'](u, function () {
                                C['locking'] || C['tab_index'] != j && (1 == C['tab_index'] && C['page_zhangban']['changed'] ? w['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](C, function () {
                                            C['change_tab'](j);
                                        }), null) : C['change_tab'](j));
                            });
                    }, u = this, b = 0; b < i['numChildren']; b++)
                        l(b);
                    this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                            C['locking'] || (1 == C['tab_index'] && C['page_zhangban']['changed'] ? w['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](C, function () {
                                        C['close'](!1);
                                    }), null) : C['close'](!1));
                        }),
                    this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                            C['locking'] || (1 == C['tab_index'] && C['page_zhangban']['changed'] ? w['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](C, function () {
                                        C['close'](!1);
                                    }), null) : C['close'](!1));
                        });
                }
                return j['prototype'].show = function () {
                    var j = this;
                    this.me['visible'] = !0,
                    this['blackmask']['alpha'] = 0,
                    this['locking'] = !0,
                    Laya['Tween'].to(this['blackmask'], {
                        alpha: 0.3
                    }, 150),
                    w['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            j['locking'] = !1;
                        })),
                    this['tab_index'] = 0,
                    this['page_zhangban']['close'](!0),
                    this['page_head'].show(!0);
                    for (var C = 0; C < this.tabs['length']; C++) {
                        var i = this.tabs[C];
                        i.skin = game['Tools']['localUISrc'](C == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var l = i['getChildByName']('word');
                        l['color'] = C == this['tab_index'] ? '#552c1c' : '#d3a86c',
                        l['scaleX'] = l['scaleY'] = C == this['tab_index'] ? 1.1 : 1,
                        C == this['tab_index'] && i['parent']['setChildIndex'](i, this.tabs['length'] - 1);
                    }
                },
                j['prototype']['change_tab'] = function (w) {
                    var j = this;
                    this['tab_index'] = w;
                    for (var C = 0; C < this.tabs['length']; C++) {
                        var i = this.tabs[C];
                        i.skin = game['Tools']['localUISrc'](C == w ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                        var l = i['getChildByName']('word');
                        l['color'] = C == w ? '#552c1c' : '#d3a86c',
                        l['scaleX'] = l['scaleY'] = C == w ? 1.1 : 1,
                        C == w && i['parent']['setChildIndex'](i, this.tabs['length'] - 1);
                    }
                    this['locking'] = !0,
                    0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(100, this, function () {
                            j['page_head'].show(!1);
                        })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(100, this, function () {
                            j['page_zhangban'].show(!1);
                        })),
                    Laya['timer'].once(400, this, function () {
                        j['locking'] = !1;
                    });
                },
                j['prototype']['close'] = function (j) {
                    var C = this;
                                    //修改友人房间立绘
                                    if (!(C.page_head.choosed_chara_index == 0 && C.page_head.choosed_skin_id == 0)) {
                                        for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                            if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                                uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = C.page_head.choosed_skin_id;
                                                GameMgr.Inst.account_data.avatar_id = C.page_head.choosed_skin_id;
                                                uiscript.UI_Sushe.main_character_id = C.page_head.choosed_chara_index + 200001;
                                                uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                                MMP.settings.characters[C.page_head.choosed_chara_index] = C.page_head.choosed_skin_id;
                                                MMP.saveSettings();
                                                break;
                                            }
                                        }
                                    }
                                    //end
                    this.me['visible'] && (j ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: l.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () {}), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), w['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    C['locking'] = !1,
                                    C.me['visible'] = !1;
                                }))));
                },
                j;
            }
            (),
            i = function () {
                function w(w) {
                    this['modes'] = [],
                    this.me = w,
                    this.bg = this.me['getChildByName']('bg'),
                    this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                }
                return w['prototype'].show = function (w) {
                    this.me['visible'] = !0,
                    this['scrollview']['reset'](),
                    this['modes'] = w,
                    this['scrollview']['addItem'](w['length']);
                    var j = this['scrollview']['total_height'];
                    j > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - j, this.bg['height'] = j + 20),
                    this.bg['visible'] = !0;
                },
                w['prototype']['render_item'] = function (w) {
                    var j = w['index'],
                    C = w['container'],
                    i = C['getChildByName']('info');
                    i['fontSize'] = 40,
                    i['fontSize'] = this['modes'][j]['length'] <= 5 ? 40 : this['modes'][j]['length'] <= 9 ? 55 - 3 * this['modes'][j]['length'] : 28,
                    i.text = this['modes'][j];
                },
                w;
            }
            (),
            l = function (l) {
                function u() {
                    var j = l.call(this, new ui['lobby']['waitingroomUI']()) || this;
                    return j['skin_ready'] = 'myres/room/btn_ready.png',
                    j['skin_cancel'] = 'myres/room/btn_cancel.png',
                    j['skin_start'] = 'myres/room/btn_start.png',
                    j['skin_start_no'] = 'myres/room/btn_start_no.png',
                    j['update_seq'] = 0,
                    j['pre_msgs'] = [],
                    j['msg_tail'] = -1,
                    j['posted'] = !1,
                    j['label_rommid'] = null,
                    j['player_cells'] = [],
                    j['btn_ok'] = null,
                    j['btn_invite_friend'] = null,
                    j['btn_add_robot'] = null,
                    j['btn_dress'] = null,
                    j['btn_copy'] = null,
                    j['beReady'] = !1,
                    j['room_id'] = -1,
                    j['owner_id'] = -1,
                    j['tournament_id'] = 0,
                    j['max_player_count'] = 0,
                    j['players'] = [],
                    j['container_rules'] = null,
                    j['container_top'] = null,
                    j['container_right'] = null,
                    j['locking'] = !1,
                    j['mousein_copy'] = !1,
                    j['popout'] = null,
                    j['room_link'] = null,
                    j['btn_copy_link'] = null,
                    j['last_start_room'] = 0,
                    j['invitefriend'] = null,
                    j['pre_choose'] = null,
                    j['ai_name'] = game['Tools']['strOfLocalization'](2003),
                    u.Inst = j,
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](j, function (w) {
                            app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](w)),
                            j['onReadyChange'](w['account_id'], w['ready'], w['dressing']);
                        })),
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](j, function (w) {
                            app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](w)),
                            j['onPlayerChange'](w);
                        })),
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](j, function (w) {
                            j['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](w)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), j['onGameStart'](w));
                        })),
                    app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](j, function (w) {
                            app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](w)),
                            j['onBeKictOut']();
                        })),
                    game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](j, function () {
                            j['enable'] && j.hide(Laya['Handler']['create'](j, function () {
                                    w['UI_Lobby'].Inst['enable'] = !0;
                                }));
                        }, null, !1)),
                    j;
                }
                return __extends(u, l),
                u['prototype']['push_msg'] = function (w) {
                    this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](w)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](w));
                },
                Object['defineProperty'](u['prototype'], 'inRoom', {
                    get: function () {
                        return -1 != this['room_id'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                Object['defineProperty'](u['prototype'], 'robot_count', {
                    get: function () {
                        for (var w = 0, j = 0; j < this['players']['length']; j++)
                            2 == this['players'][j]['category'] && w++;
                        return w;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                u['prototype']['resetData'] = function () {
                    this['room_id'] = -1,
                    this['owner_id'] = -1,
                    this['room_mode'] = {},
                    this['max_player_count'] = 0,
                    this['players'] = [];
                },
                u['prototype']['updateData'] = function (w) {
                    if (!w)
                        return this['resetData'](), void 0;
                                    //修改友人房间立绘
                                    for (let i = 0; i < w.persons.length; i++) {
        
                                        if (w.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            w.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            w.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            w.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                            w.persons[i].title = GameMgr.Inst.account_data.title;
                                            w.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                            if (MMP.settings.nickname != '') {
                                                w.persons[i].nickname = MMP.settings.nickname;
                                            }
                                            break;
                                        }
                                    }
                                    //end
                    this['room_id'] = w['room_id'],
                    this['owner_id'] = w['owner_id'],
                    this['room_mode'] = w.mode,
                    this['public_live'] = w['public_live'],
                    this['tournament_id'] = 0,
                    w['tournament_id'] && (this['tournament_id'] = w['tournament_id']),
                    this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                    this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                    this['max_player_count'] = w['max_player_count'],
                    this['players'] = [];
                    for (var j = 0; j < w['persons']['length']; j++) {
                        var C = w['persons'][j];
                        C['ready'] = !1,
                        C['cell_index'] = -1,
                        C['category'] = 1,
                        this['players'].push(C);
                    }
                    for (var j = 0; j < w['robot_count']; j++)
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
                    for (var j = 0; j < w['ready_list']['length']; j++)
                        for (var i = 0; i < this['players']['length']; i++)
                            if (this['players'][i]['account_id'] == w['ready_list'][j]) {
                                this['players'][i]['ready'] = !0;
                                break;
                            }
                    this['update_seq'] = 0,
                    w.seq && (this['update_seq'] = w.seq);
                },
                u['prototype']['onReadyChange'] = function (w, j, C) {
                    for (var i = 0; i < this['players']['length']; i++)
                        if (this['players'][i]['account_id'] == w) {
                            this['players'][i]['ready'] = j,
                            this['players'][i]['dressing'] = C,
                            this['_onPlayerReadyChange'](this['players'][i]);
                            break;
                        }
                    this['refreshStart']();
                },
                u['prototype']['onPlayerChange'] = function (w) {
                    if (app.Log.log(w), w = w['toJSON'](), !(w.seq && w.seq <= this['update_seq'])) {
                                        // 修改友人房间立绘
                                        for (var i = 0; i < w.player_list.length; i++) {
        
                                            if (w.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                                w.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                w.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                                w.player_list[i].title = GameMgr.Inst.account_data.title;
                                                if (MMP.settings.nickname != '') {
                                                    w.player_list[i].nickname = MMP.settings.nickname;
                                                }
                                                break;
                                            }
                                        }
                                        if (k.update_list != undefined) {
                                            for (var i = 0; i < w.update_list.length; i++) {
        
                                                if (w.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                                    w.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                    w.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                                    w.update_list[i].title = GameMgr.Inst.account_data.title;
                                                    if (MMP.settings.nickname != '') {
                                                        w.update_list[i].nickname = MMP.settings.nickname;
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
                        this['update_seq'] = w.seq;
                        var j = {};
                        j.type = 'onPlayerChange0',
                        j['players'] = this['players'],
                        j.msg = w,
                        this['push_msg'](JSON['stringify'](j));
                        var C = this['robot_count'],
                        i = w['robot_count'];
                        if (i < this['robot_count']) {
                            this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, C--);
                            for (var l = 0; l < this['players']['length']; l++)
                                2 == this['players'][l]['category'] && C > i && (this['players'][l]['category'] = 0, C--);
                        }
                        for (var u = [], b = w['player_list'], l = 0; l < this['players']['length']; l++)
                            if (1 == this['players'][l]['category']) {
                                for (var V = -1, k = 0; k < b['length']; k++)
                                    if (b[k]['account_id'] == this['players'][l]['account_id']) {
                                        V = k;
                                        break;
                                    }
                                if (-1 != V) {
                                    var S = b[V];
                                    u.push(this['players'][l]),
                                    this['players'][l]['avatar_id'] = S['avatar_id'],
                                    this['players'][l]['title'] = S['title'],
                                    this['players'][l]['verified'] = S['verified'];
                                }
                            } else
                                2 == this['players'][l]['category'] && u.push(this['players'][l]);
                        this['players'] = u;
                        for (var l = 0; l < b['length']; l++) {
                            for (var H = !1, S = b[l], k = 0; k < this['players']['length']; k++)
                                if (1 == this['players'][k]['category'] && this['players'][k]['account_id'] == S['account_id']) {
                                    H = !0;
                                    break;
                                }
                            H || this['players'].push({
                                account_id: S['account_id'],
                                avatar_id: S['avatar_id'],
                                nickname: S['nickname'],
                                verified: S['verified'],
                                title: S['title'],
                                level: S['level'],
                                level3: S['level3'],
                                ready: !1,
                                dressing: !1,
                                cell_index: -1,
                                category: 1
                            });
                        }
                        for (var N = [!1, !1, !1, !1], l = 0; l < this['players']['length']; l++)
                             - 1 != this['players'][l]['cell_index'] && (N[this['players'][l]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][l]));
                        for (var l = 0; l < this['players']['length']; l++)
                            if (1 == this['players'][l]['category'] && -1 == this['players'][l]['cell_index'])
                                for (var k = 0; k < this['max_player_count']; k++)
                                    if (!N[k]) {
                                        this['players'][l]['cell_index'] = k,
                                        N[k] = !0,
                                        this['_refreshPlayerInfo'](this['players'][l]);
                                        break;
                                    }
                        for (var C = this['robot_count'], i = w['robot_count']; i > C; ) {
                            for (var W = -1, k = 0; k < this['max_player_count']; k++)
                                if (!N[k]) {
                                    W = k;
                                    break;
                                }
                            if (-1 == W)
                                break;
                            N[W] = !0,
                            this['players'].push({
                                category: 2,
                                cell_index: W,
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
                            C++;
                        }
                        for (var l = 0; l < this['max_player_count']; l++)
                            N[l] || this['_clearCell'](l);
                        var j = {};
                        if (j.type = 'onPlayerChange1', j['players'] = this['players'], this['push_msg'](JSON['stringify'](j)), w['owner_id']) {
                            if (this['owner_id'] = w['owner_id'], this['enable'])
                                if (this['owner_id'] == GameMgr.Inst['account_id'])
                                    this['refreshAsOwner']();
                                else
                                    for (var k = 0; k < this['players']['length']; k++)
                                        if (this['players'][k] && this['players'][k]['account_id'] == this['owner_id']) {
                                            this['_refreshPlayerInfo'](this['players'][k]);
                                            break;
                                        }
                        } else if (this['enable'])
                            if (this['owner_id'] == GameMgr.Inst['account_id'])
                                this['refreshAsOwner']();
                            else
                                for (var k = 0; k < this['players']['length']; k++)
                                    if (this['players'][k] && this['players'][k]['account_id'] == this['owner_id']) {
                                        this['_refreshPlayerInfo'](this['players'][k]);
                                        break;
                                    }
                    }
                },
                u['prototype']['onBeKictOut'] = function () {
                    this['resetData'](),
                    this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), w['UI_Lobby'].Inst['enable'] = !0, w['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                },
                u['prototype']['onCreate'] = function () {
                    var l = this;
                    this['last_start_room'] = 0;
                    var u = this.me['getChildByName']('root');
                    this['container_top'] = u['getChildByName']('top'),
                    this['container_right'] = u['getChildByName']('right'),
                    this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                    for (var b = function (j) {
                        var C = u['getChildByName']('player_' + j['toString']()),
                        i = {};
                        i['index'] = j,
                        i['container'] = C,
                        i['container_flag'] = C['getChildByName']('flag'),
                        i['container_flag']['visible'] = !1,
                        i['container_name'] = C['getChildByName']('container_name'),
                        i.name = C['getChildByName']('container_name')['getChildByName']('name'),
                        i['btn_t'] = C['getChildByName']('btn_t'),
                        i['container_illust'] = C['getChildByName']('container_illust'),
                        i['illust'] = new w['UI_Character_Skin'](C['getChildByName']('container_illust')['getChildByName']('illust')),
                        i.host = C['getChildByName']('host'),
                        i['title'] = new w['UI_PlayerTitle'](C['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                        i.rank = new w['UI_Level'](C['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                        i['is_robot'] = !1;
                        var b = 0;
                        i['btn_t']['clickHandler'] = Laya['Handler']['create'](V, function () {
                                if (!(l['locking'] || Laya['timer']['currTimer'] < b)) {
                                    b = Laya['timer']['currTimer'] + 500;
                                    for (var w = 0; w < l['players']['length']; w++)
                                        if (l['players'][w]['cell_index'] == j) {
                                            l['kickPlayer'](w);
                                            break;
                                        }
                                }
                            }, null, !1),
                        i['btn_info'] = C['getChildByName']('btn_info'),
                        i['btn_info']['clickHandler'] = Laya['Handler']['create'](V, function () {
                                if (!l['locking'])
                                    for (var C = 0; C < l['players']['length']; C++)
                                        if (l['players'][C]['cell_index'] == j) {
                                            l['players'][C]['account_id'] && l['players'][C]['account_id'] > 0 && w['UI_OtherPlayerInfo'].Inst.show(l['players'][C]['account_id'], l['room_mode'].mode < 10 ? 1 : 2, 1);
                                            break;
                                        }
                            }, null, !1),
                        V['player_cells'].push(i);
                    }, V = this, k = 0; 4 > k; k++)
                        b(k);
                    this['btn_ok'] = u['getChildByName']('btn_ok');
                    var S = 0;
                    this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            Laya['timer']['currTimer'] < S + 500 || (S = Laya['timer']['currTimer'], l['owner_id'] == GameMgr.Inst['account_id'] ? l['getStart']() : l['switchReady']());
                        }, null, !1);
                    var H = 0;
                    this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            Laya['timer']['currTimer'] < H + 500 || (H = Laya['timer']['currTimer'], l['leaveRoom']());
                        }, null, !1),
                    this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                    this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            l['locking'] || l['invitefriend'].show();
                        }, null, !1),
                    this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                    var N = 0;
                    this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            l['locking'] || Laya['timer']['currTimer'] < N || (N = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: l['robot_count'] + 1
                                }, function (j, C) {
                                    (j || C['error'] && 1111 != C['error'].code) && w['UIMgr'].Inst['showNetReqError']('modifyRoom_add', j, C),
                                    N = 0;
                                }));
                        }, null, !1),
                    this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            if (!l['locking']) {
                                var j = 0;
                                l['room_mode']['detail_rule'] && l['room_mode']['detail_rule']['chuanma'] && (j = 1),
                                w['UI_Rules'].Inst.show(0, null, j);
                            }
                        }, null, !1),
                    this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                    this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                            l['locking'] || l['beReady'] && l['owner_id'] != GameMgr.Inst['account_id'] || (l['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                    ready: l['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                    dressing: !0
                                }, function () {}));
                        }),
                    this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                    this['btn_copy'].on('mouseover', this, function () {
                        l['mousein_copy'] = !0;
                    }),
                    this['btn_copy'].on('mouseout', this, function () {
                        l['mousein_copy'] = !1;
                    }),
                    this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            l['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), l['popout']['visible'] = !0, w['UIBase']['anim_pop_out'](l['popout'], null));
                        }, null, !1),
                    this['container_rules'] = new i(this['container_right']['getChildByName']('container_rules')),
                    this['popout'] = this.me['getChildByName']('pop'),
                    this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                    this['room_link']['editable'] = !1,
                    this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                    this['btn_copy_link']['visible'] = !1,
                    GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                var j = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                j.call('setSysClipboardText', l['room_link'].text),
                                w['UIBase']['anim_pop_hide'](l['popout'], Laya['Handler']['create'](l, function () {
                                        l['popout']['visible'] = !1;
                                    })),
                                w['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                            }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', l['room_link'].text, function () {}),
                                w['UIBase']['anim_pop_hide'](l['popout'], Laya['Handler']['create'](l, function () {
                                        l['popout']['visible'] = !1;
                                    })),
                                w['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                            }, null, !1)),
                    this['popout']['visible'] = !1,
                    this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            w['UIBase']['anim_pop_hide'](l['popout'], Laya['Handler']['create'](l, function () {
                                    l['popout']['visible'] = !1;
                                }));
                        }, null, !1),
                    this['invitefriend'] = new j(this.me['getChildByName']('invite_friend')),
                    this['pop_change_view'] = new C(this.me['getChildByName']('pop_view'));
                },
                u['prototype'].show = function () {
                    var j = this;
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                    this['mousein_copy'] = !1,
                    this['beReady'] = !1,
                    this['invitefriend'].me['visible'] = !1,
                    this['btn_add_robot']['visible'] = !1,
                    this['btn_invite_friend']['visible'] = !1,
                    game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                    this['pre_choose'] = null,
                    this['pop_change_view']['close'](!0);
                    for (var C = 0; 4 > C; C++)
                        this['player_cells'][C]['container']['visible'] = C < this['max_player_count'];
                    for (var C = 0; C < this['max_player_count']; C++)
                        this['_clearCell'](C);
                    for (var C = 0; C < this['players']['length']; C++)
                        this['players'][C]['cell_index'] = C, this['_refreshPlayerInfo'](this['players'][C]);
                    this['msg_tail'] = -1,
                    this['pre_msgs'] = [],
                    this['posted'] = !1;
                    var i = {};
                    i.type = 'show',
                    i['players'] = this['players'],
                    this['push_msg'](JSON['stringify'](i)),
                    this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                    this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                    var l = [];
                    l.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                    var u = this['room_mode']['detail_rule'];
                    if (u) {
                        var b = 5,
                        V = 20;
                        if (null != u['time_fixed'] && (b = u['time_fixed']), null != u['time_add'] && (V = u['time_add']), l.push(b['toString']() + '+' + V['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                            var k = cfg['tournament']['tournaments'].get(this['tournament_id']);
                            k && l.push(k.name);
                        }
                        if (null != u['init_point'] && l.push(game['Tools']['strOfLocalization'](2199) + u['init_point']), null != u['fandian'] && l.push(game['Tools']['strOfLocalization'](2094) + ':' + u['fandian']), u['guyi_mode'] && l.push(game['Tools']['strOfLocalization'](3028)), null != u['dora_count'])
                            switch (u['chuanma'] && (u['dora_count'] = 0), u['dora_count']) {
                            case 0:
                                l.push(game['Tools']['strOfLocalization'](2044));
                                break;
                            case 2:
                                l.push(game['Tools']['strOfLocalization'](2047));
                                break;
                            case 3:
                                l.push(game['Tools']['strOfLocalization'](2045));
                                break;
                            case 4:
                                l.push(game['Tools']['strOfLocalization'](2046));
                            }
                        null != u['shiduan'] && 1 != u['shiduan'] && l.push(game['Tools']['strOfLocalization'](2137)),
                        2 === u['fanfu'] && l.push(game['Tools']['strOfLocalization'](2763)),
                        4 === u['fanfu'] && l.push(game['Tools']['strOfLocalization'](2764)),
                        null != u['bianjietishi'] && 1 != u['bianjietishi'] && l.push(game['Tools']['strOfLocalization'](2200)),
                        this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != u['have_zimosun'] && 1 != u['have_zimosun'] ? l.push(game['Tools']['strOfLocalization'](2202)) : l.push(game['Tools']['strOfLocalization'](2203))),
                        game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                    }
                    this['container_rules'].show(l),
                    this['enable'] = !0,
                    this['locking'] = !0,
                    w['UIBase']['anim_alpha_in'](this['container_top'], {
                        y: -30
                    }, 200);
                    for (var C = 0; C < this['player_cells']['length']; C++)
                        w['UIBase']['anim_alpha_in'](this['player_cells'][C]['container'], {
                            x: 80
                        }, 150, 150 + 50 * C, null, Laya.Ease['backOut']);
                    w['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                    w['UIBase']['anim_alpha_in'](this['container_right'], {
                        x: 20
                    }, 100, 500),
                    Laya['timer'].once(600, this, function () {
                        j['locking'] = !1;
                    });
                    var S = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                    this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                    '' != S && (this['room_link'].text += '(' + S + ')');
                    var H = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                    this['room_link'].text += ': ' + H + '?room=' + this['room_id'];
                },
                u['prototype']['leaveRoom'] = function () {
                    var j = this;
                    this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (C, i) {
                        C || i['error'] ? w['UIMgr'].Inst['showNetReqError']('leaveRoom', C, i) : (j['room_id'] = -1, j.hide(Laya['Handler']['create'](j, function () {
                                    w['UI_Lobby'].Inst['enable'] = !0;
                                })));
                    });
                },
                u['prototype']['tryToClose'] = function (j) {
                    var C = this;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (i, l) {
                        i || l['error'] ? (w['UIMgr'].Inst['showNetReqError']('leaveRoom', i, l), j['runWith'](!1)) : (C['enable'] = !1, C['pop_change_view']['close'](!0), j['runWith'](!0));
                    });
                },
                u['prototype'].hide = function (j) {
                    var C = this;
                    this['locking'] = !0,
                    w['UIBase']['anim_alpha_out'](this['container_top'], {
                        y: -30
                    }, 150);
                    for (var i = 0; i < this['player_cells']['length']; i++)
                        w['UIBase']['anim_alpha_out'](this['player_cells'][i]['container'], {
                            x: 80
                        }, 150, 0, null);
                    w['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                    w['UIBase']['anim_alpha_out'](this['container_right'], {
                        x: 20
                    }, 150),
                    Laya['timer'].once(200, this, function () {
                        C['locking'] = !1,
                        C['enable'] = !1,
                        j && j.run();
                    }),
                    document['getElementById']('layaCanvas')['onclick'] = null;
                },
                u['prototype']['onDisbale'] = function () {
                    Laya['timer']['clearAll'](this);
                    for (var w = 0; w < this['player_cells']['length']; w++)
                        Laya['loader']['clearTextureRes'](this['player_cells'][w]['illust'].skin);
                    document['getElementById']('layaCanvas')['onclick'] = null;
                },
                u['prototype']['switchReady'] = function () {
                    this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                            ready: this['beReady'],
                            dressing: !1
                        }, function () {}));
                },
                u['prototype']['getStart'] = function () {
                    this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (j, C) {
                                (j || C['error']) && w['UIMgr'].Inst['showNetReqError']('startRoom', j, C);
                            })));
                },
                u['prototype']['kickPlayer'] = function (j) {
                    if (this['owner_id'] == GameMgr.Inst['account_id']) {
                        var C = this['players'][j];
                        1 == C['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                            account_id: this['players'][j]['account_id']
                        }, function () {}) : 2 == C['category'] && (this['pre_choose'] = C, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                robot_count: this['robot_count'] - 1
                            }, function (j, C) {
                                (j || C['error']) && w['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', j, C);
                            }));
                    }
                },
                u['prototype']['_clearCell'] = function (w) {
                    if (!(0 > w || w >= this['player_cells']['length'])) {
                        var j = this['player_cells'][w];
                        j['container_flag']['visible'] = !1,
                        j['container_illust']['visible'] = !1,
                        j.name['visible'] = !1,
                        j['container_name']['visible'] = !1,
                        j['btn_t']['visible'] = !1,
                        j.host['visible'] = !1,
                        j['illust']['clear']();
                    }
                },
                u['prototype']['_refreshPlayerInfo'] = function (w) {
                    var j = w['cell_index'];
                    if (!(0 > j || j >= this['player_cells']['length'])) {
                        var C = this['player_cells'][j];
                        C['container_illust']['visible'] = !0,
                        C['container_name']['visible'] = !0,
                        C.name['visible'] = !0,
                        game['Tools']['SetNickname'](C.name, w),
                        C['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && w['account_id'] != GameMgr.Inst['account_id'],
                        this['owner_id'] == w['account_id'] && (C['container_flag']['visible'] = !0, C.host['visible'] = !0),
                        w['account_id'] == GameMgr.Inst['account_id'] ? C['illust']['setSkin'](w['avatar_id'], 'waitingroom') : C['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](w['avatar_id']), 'waitingroom'),
                        C['title'].id = game['Tools']['titleLocalization'](w['account_id'], w['title']),
                        C.rank.id = w[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                        this['_onPlayerReadyChange'](w);
                    }
                },
                u['prototype']['_onPlayerReadyChange'] = function (w) {
                    var j = w['cell_index'];
                    if (!(0 > j || j >= this['player_cells']['length'])) {
                        var C = this['player_cells'][j];
                        C['container_flag']['visible'] = this['owner_id'] == w['account_id'] ? !0 : w['ready'];
                    }
                },
                u['prototype']['refreshAsOwner'] = function () {
                    if (this['owner_id'] == GameMgr.Inst['account_id']) {
                        for (var w = 0, j = 0; j < this['players']['length']; j++)
                            0 != this['players'][j]['category'] && (this['_refreshPlayerInfo'](this['players'][j]), w++);
                        this['btn_add_robot']['visible'] = !0,
                        this['btn_invite_friend']['visible'] = !0,
                        game['Tools']['setGrayDisable'](this['btn_invite_friend'], w == this['max_player_count']),
                        game['Tools']['setGrayDisable'](this['btn_add_robot'], w == this['max_player_count']),
                        this['refreshStart']();
                    }
                },
                u['prototype']['refreshStart'] = function () {
                    if (this['owner_id'] == GameMgr.Inst['account_id']) {
                        this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                        game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                        for (var w = 0, j = 0; j < this['players']['length']; j++) {
                            var C = this['players'][j];
                            if (!C || 0 == C['category'])
                                break;
                            (C['account_id'] == this['owner_id'] || C['ready']) && w++;
                        }
                        if (game['Tools']['setGrayDisable'](this['btn_ok'], w != this['max_player_count']), this['enable']) {
                            for (var i = 0, j = 0; j < this['max_player_count']; j++) {
                                var l = this['player_cells'][j];
                                l && l['container_flag']['visible'] && i++;
                            }
                            if (w != i && !this['posted']) {
                                this['posted'] = !0;
                                var u = {};
                                u['okcount'] = w,
                                u['okcount2'] = i,
                                u.msgs = [];
                                var b = 0,
                                V = this['pre_msgs']['length'] - 1;
                                if (-1 != this['msg_tail'] && (b = (this['msg_tail'] + 1) % this['pre_msgs']['length'], V = this['msg_tail']), b >= 0 && V >= 0) {
                                    for (var j = b; j != V; j = (j + 1) % this['pre_msgs']['length'])
                                        u.msgs.push(this['pre_msgs'][j]);
                                    u.msgs.push(this['pre_msgs'][V]);
                                }
                                GameMgr.Inst['postInfo2Server']('waitroom_err2', u, !1);
                            }
                        }
                    }
                },
                u['prototype']['onGameStart'] = function (w) {
                    game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                    this['enable'] = !1,
                    game['MJNetMgr'].Inst['OpenConnect'](w['connect_token'], w['game_uuid'], w['location'], !1, null);
                },
                u['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                },
                u['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                },
                u.Inst = null,
                u;
            }
            (w['UIBase']);
            w['UI_WaitingRoom'] = l;
        }
        (uiscript || (uiscript = {}));
        






        // 保存装扮
        !function (w) {
            var j;
            !function (j) {
                var C = function () {
                    function C(C, i, l) {
                        var u = this;
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
                        this['_locking'] = l,
                        this['container_zhuangban0'] = C,
                        this['container_zhuangban1'] = i;
                        var b = this['container_zhuangban0']['getChildByName']('tabs');
                        b['vScrollBarSkin'] = '';
                        for (var V = function (j) {
                            var C = b['getChildAt'](j);
                            k.tabs.push(C),
                            C['clickHandler'] = new Laya['Handler'](k, function () {
                                    u['locking'] || u['tab_index'] != j && (u['_changed'] ? w['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](u, function () {
                                                u['change_tab'](j);
                                            }), null) : u['change_tab'](j));
                                });
                        }, k = this, S = 0; S < b['numChildren']; S++)
                            V(S);
                        this['page_items'] = new j['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                        this['page_headframe'] = new j['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                        this['page_bgm'] = new j['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                        this['page_desktop'] = new j['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                        this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                        this['scrollview']['setElastic'](),
                        this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                        this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                        this['btn_save']['clickHandler'] = new Laya['Handler'](this, function () {
                                for (var j = [], C = 0; C < u['cell_titles']['length']; C++) {
                                    var i = u['slot_ids'][C];
                                    if (u['slot_map'][i]) {
                                        var l = u['slot_map'][i];
                                        if (!(l['item_id'] && l['item_id'] != u['cell_default_item'][C] || l['item_id_list'] && 0 != l['item_id_list']['length']))
                                            continue;
                                        var b = [];
                                        if (l['item_id_list'])
                                            for (var V = 0, k = l['item_id_list']; V < k['length']; V++) {
                                                var S = k[V];
                                                S == u['cell_default_item'][C] ? b.push(0) : b.push(S);
                                            }
                                        j.push({
                                            slot: i,
                                            item_id: l['item_id'],
                                            type: l.type,
                                            item_id_list: b
                                        });
                                    }
                                }
                                u['btn_save']['mouseEnabled'] = !1;
                                var H = u['tab_index'];
                                        // START
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                //    views: j,
                                //    save_index: H,
                                //    is_use: H == w['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                //}, function (C, i) {
                                //    if (u['btn_save']['mouseEnabled'] = !0, C || i['error'])
                                //        w['UIMgr'].Inst['showNetReqError']('saveCommonViews', C, i);
                                //    else {
                                        if (w['UI_Sushe']['commonViewList']['length'] < H)
                                            for (var l = w['UI_Sushe']['commonViewList']['length']; H >= l; l++)
                                                w['UI_Sushe']['commonViewList'].push([]);
                                        MMP.settings.commonViewList = w.UI_Sushe.commonViewList;
                                        MMP.settings.using_commonview_index = w.UI_Sushe.using_commonview_index;
                                        MMP.saveSettings();
                                        //END
                                        if (w['UI_Sushe']['commonViewList'][H] = j, w['UI_Sushe']['using_commonview_index'] == H && u['onChangeGameView'](), u['tab_index'] != H)
                                            return;
                                        u['btn_save']['mouseEnabled'] = !0,
                                        u['_changed'] = !1,
                                        u['refresh_btn']();
                                //    }
                                //});
                            }),
                        this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                        this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                                u['btn_use']['mouseEnabled'] = !1;
                                var j = u['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                //    index: j
                                //}, function (C, i) {
                                //    u['btn_use']['mouseEnabled'] = !0,
                                //    C || i['error'] ? w['UIMgr'].Inst['showNetReqError']('useCommonView', C, i) : (
                                w['UI_Sushe']['using_commonview_index'] = j, u['refresh_btn'](), u['refresh_tab'](), u['onChangeGameView']();//);
                                //});
                            }),
                        this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                        this['random_slider'] = this['random']['getChildByName']('slider'),
                        this['btn_random'] = this['random']['getChildByName']('btn'),
                        this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                                u['onRandomBtnClick']();
                            });
                    }
                    return Object['defineProperty'](C['prototype'], 'locking', {
                        get: function () {
                            return this['_locking'] ? this['_locking'].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object['defineProperty'](C['prototype'], 'changed', {
                        get: function () {
                            return this['_changed'];
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    C['prototype'].show = function (j) {
                        game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                        this['container_zhuangban0']['visible'] = !0,
                        this['container_zhuangban1']['visible'] = !0,
                        j ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (w['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), w['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                x: 0
                            }, 200)),
                        this['change_tab'](w['UI_Sushe']['using_commonview_index']);
                    },
                    C['prototype']['change_tab'] = function (j) {
                        if (this['tab_index'] = j, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                            if (this['tab_index'] < w['UI_Sushe']['commonViewList']['length'])
                                for (var C = w['UI_Sushe']['commonViewList'][this['tab_index']], i = 0; i < C['length']; i++)
                                    this['slot_map'][C[i].slot] = {
                                        slot: C[i].slot,
                                        item_id: C[i]['item_id'],
                                        type: C[i].type,
                                        item_id_list: C[i]['item_id_list']
                                    };
                            this['scrollview']['addItem'](this['cell_titles']['length']),
                            this['onChangeSlotSelect'](0),
                            this['refresh_btn']();
                        }
                    },
                    C['prototype']['refresh_tab'] = function () {
                        for (var j = 0; j < this.tabs['length']; j++) {
                            var C = this.tabs[j];
                            C['mouseEnabled'] = this['tab_index'] != j,
                            C['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == j ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                            C['getChildByName']('num')['color'] = this['tab_index'] == j ? '#2f1e19' : '#f2c797';
                            var i = C['getChildByName']('choosed');
                            w['UI_Sushe']['using_commonview_index'] == j ? (i['visible'] = !0, i.x = this['tab_index'] == j ? -18 : -4) : i['visible'] = !1;
                        }
                    },
                    C['prototype']['refresh_btn'] = function () {
                        this['btn_save']['visible'] = !1,
                        this['btn_save']['mouseEnabled'] = !0,
                        this['btn_use']['visible'] = !1,
                        this['btn_use']['mouseEnabled'] = !0,
                        this['btn_using']['visible'] = !1,
                        this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = w['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = w['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                    },
                    C['prototype']['onChangeSlotSelect'] = function (w) {
                        var j = this;
                        this['select_index'] = w,
                        this['random']['visible'] = !(6 == w || 9 == w);
                        var C = 0;
                        w >= 0 && w < this['cell_default_item']['length'] && (C = this['cell_default_item'][w]);
                        var i = C,
                        l = this['slot_ids'][w],
                        u = !1,
                        b = [];
                        if (this['slot_map'][l]) {
                            var V = this['slot_map'][l];
                            b = V['item_id_list'],
                            u = !!V.type,
                            V['item_id'] && (i = this['slot_map'][l]['item_id']),
                            u && V['item_id_list'] && V['item_id_list']['length'] > 0 && (i = V['item_id_list'][0]);
                        }
                        var k = Laya['Handler']['create'](this, function (i) {
                                if (i == C && (i = 0), j['is_random']) {
                                    var u = j['slot_map'][l]['item_id_list']['indexOf'](i);
                                    u >= 0 ? j['slot_map'][l]['item_id_list']['splice'](u, 1) : (j['slot_map'][l]['item_id_list'] && 0 != j['slot_map'][l]['item_id_list']['length'] || (j['slot_map'][l]['item_id_list'] = []), j['slot_map'][l]['item_id_list'].push(i));
                                } else
                                    j['slot_map'][l] || (j['slot_map'][l] = {}), j['slot_map'][l]['item_id'] = i;
                                j['scrollview']['wantToRefreshItem'](w),
                                j['_changed'] = !0,
                                j['refresh_btn']();
                            }, null, !1);
                        this['page_items']['close'](),
                        this['page_desktop']['close'](),
                        this['page_headframe']['close'](),
                        this['page_bgm']['close'](),
                        this['is_random'] = u,
                        this['random_slider'].x = u ? 76 : -4,
                        this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                        this['random']['getChildAt'](2)['visible'] = this['is_random'];
                        var S = game['Tools']['strOfLocalization'](this['cell_titles'][w]);
                        if (w >= 0 && 2 >= w)
                            this['page_items'].show(S, w, i, k), this['setRandomGray'](!this['page_items']['can_random']());
                        else if (3 == w)
                            this['page_items'].show(S, 10, i, k), this['setRandomGray'](!this['page_items']['can_random']());
                        else if (4 == w)
                            this['page_items'].show(S, 3, i, k), this['setRandomGray'](!this['page_items']['can_random']());
                        else if (5 == w)
                            this['page_bgm'].show(S, i, k), this['setRandomGray'](!this['page_bgm']['can_random']());
                        else if (6 == w)
                            this['page_headframe'].show(S, i, k);
                        else if (7 == w || 8 == w) {
                            var H = this['cell_default_item'][7],
                            N = this['cell_default_item'][8];
                            if (7 == w) {
                                if (H = i, this['slot_map'][game['EView'].mjp]) {
                                    var W = this['slot_map'][game['EView'].mjp];
                                    W.type && W['item_id_list'] && W['item_id_list']['length'] > 0 ? N = W['item_id_list'][0] : W['item_id'] && (N = W['item_id']);
                                }
                                this['page_desktop']['show_desktop'](S, H, N, k);
                            } else {
                                if (N = i, this['slot_map'][game['EView']['desktop']]) {
                                    var W = this['slot_map'][game['EView']['desktop']];
                                    W.type && W['item_id_list'] && W['item_id_list']['length'] > 0 ? H = W['item_id_list'][0] : W['item_id'] && (H = W['item_id']);
                                }
                                this['page_desktop']['show_mjp'](S, H, N, k);
                            }
                            this['setRandomGray'](!this['page_desktop']['can_random']());
                        } else
                            9 == w && this['page_desktop']['show_lobby_bg'](S, i, k);
                    },
                    C['prototype']['onRandomBtnClick'] = function () {
                        var w = this;
                        if (6 != this['select_index'] && 9 != this['select_index']) {
                            this['_changed'] = !0,
                            this['refresh_btn'](),
                            this['is_random'] = !this['is_random'],
                            this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                            Laya['Tween'].to(this['random_slider'], {
                                x: this['is_random'] ? 76 : -4
                            }, 100, null, Laya['Handler']['create'](this, function () {
                                    w['random']['getChildAt'](w['is_random'] ? 1 : 2)['visible'] = !1;
                                }));
                            var j = this['select_index'],
                            C = this['slot_ids'][j],
                            i = 0;
                            j >= 0 && j < this['cell_default_item']['length'] && (i = this['cell_default_item'][j]);
                            var l = i,
                            u = [];
                            if (this['slot_map'][C]) {
                                var b = this['slot_map'][C];
                                u = b['item_id_list'],
                                b['item_id'] && (l = this['slot_map'][C]['item_id']);
                            }
                            if (j >= 0 && 4 >= j) {
                                var V = this['slot_map'][C];
                                V ? (V.type = V.type ? 0 : 1, V['item_id_list'] && 0 != V['item_id_list']['length'] || (V['item_id_list'] = [V['item_id']])) : this['slot_map'][C] = {
                                    type: 1,
                                    item_id_list: [this['page_items']['items'][0]]
                                },
                                this['page_items']['changeRandomState'](l);
                            } else if (5 == j) {
                                var V = this['slot_map'][C];
                                if (V)
                                    V.type = V.type ? 0 : 1, V['item_id_list'] && 0 != V['item_id_list']['length'] || (V['item_id_list'] = [V['item_id']]);
                                else {
                                    this['slot_map'][C] = {
                                        type: 1,
                                        item_id_list: [this['page_bgm']['items'][0]]
                                    };
                                }
                                this['page_bgm']['changeRandomState'](l);
                            } else if (7 == j || 8 == j) {
                                var V = this['slot_map'][C];
                                if (V)
                                    V.type = V.type ? 0 : 1, V['item_id_list'] && 0 != V['item_id_list']['length'] || (V['item_id_list'] = [V['item_id']]);
                                else {
                                    this['slot_map'][C] = {
                                        type: 1,
                                        item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                    };
                                }
                                this['page_desktop']['changeRandomState'](l);
                            }
                            this['scrollview']['wantToRefreshItem'](j);
                        }
                    },
                    C['prototype']['render_view'] = function (w) {
                        var j = this,
                        C = w['container'],
                        i = w['index'],
                        l = C['getChildByName']('cell');
                        this['select_index'] == i ? (l['scaleX'] = l['scaleY'] = 1.05, l['getChildByName']('choosed')['visible'] = !0) : (l['scaleX'] = l['scaleY'] = 1, l['getChildByName']('choosed')['visible'] = !1),
                        l['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][i]);
                        var u = l['getChildByName']('name'),
                        b = l['getChildByName']('icon'),
                        V = this['cell_default_item'][i],
                        k = this['slot_ids'][i],
                        S = !1;
                        if (this['slot_map'][k] && (S = this['slot_map'][k].type, this['slot_map'][k]['item_id'] && (V = this['slot_map'][k]['item_id'])), S)
                            u.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][k]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](b, 'myres/sushe/icon_random.jpg');
                        else {
                            var H = cfg['item_definition'].item.get(V);
                            H ? (u.text = H['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](b, H.icon, null, 'UI_Sushe_Select.Zhuangban')) : (u.text = game['Tools']['strOfLocalization'](this['cell_names'][i]), game['LoadMgr']['setImgSkin'](b, this['cell_default_img'][i], null, 'UI_Sushe_Select.Zhuangban'));
                        }
                        var N = l['getChildByName']('btn');
                        N['clickHandler'] = Laya['Handler']['create'](this, function () {
                                j['locking'] || j['select_index'] != i && (j['onChangeSlotSelect'](i), j['scrollview']['wantToRefreshAll']());
                            }, null, !1),
                        N['mouseEnabled'] = this['select_index'] != i;
                    },
                    C['prototype']['close'] = function (j) {
                        var C = this;
                        this['container_zhuangban0']['visible'] && (j ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (w['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), w['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200, 0, Laya['Handler']['create'](this, function () {
                                        C['page_items']['close'](),
                                        C['page_desktop']['close'](),
                                        C['page_headframe']['close'](),
                                        C['page_bgm']['close'](),
                                        C['container_zhuangban0']['visible'] = !1,
                                        C['container_zhuangban1']['visible'] = !1,
                                        game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                                    }))));
                    },
                    C['prototype']['onChangeGameView'] = function () {
                                    // 保存装扮页
                                    MMP.settings.using_commonview_index = w.UI_Sushe.using_commonview_index;
                                    MMP.saveSettings();
                                    // END
                        w['UI_Sushe']['randomDesktopID'](),
                        GameMgr.Inst['load_mjp_view']();
                        var j = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                        w['UI_Lite_Loading'].Inst.show(),
                        game['Scene_Lobby'].Inst['set_lobby_bg'](j, Laya['Handler']['create'](this, function () {
                                w['UI_Lite_Loading'].Inst['enable'] && w['UI_Lite_Loading'].Inst['close']();
                            })),
                        GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                    },
                    C['prototype']['setRandomGray'] = function (j) {
                        this['btn_random']['visible'] = !j,
                        this['random']['filters'] = j ? [new Laya['ColorFilter'](w['GRAY_FILTER'])] : [];
                    },
                    C['prototype']['getShowSlotInfo'] = function () {
                        return this['slot_map'][this['slot_ids'][this['select_index']]];
                    },
                    C['prototype']['changeSlotByItemId'] = function (w) {
                        var j = cfg['item_definition'].item.get(w);
                        if (j)
                            for (var C = 0; C < this['slot_ids']['length']; C++)
                                if (this['slot_ids'][C] == j.type)
                                    return this['onChangeSlotSelect'](C), this['scrollview']['wantToRefreshAll'](), void 0;
                    },
                    C;
                }
                ();
                j['Container_Zhuangban'] = C;
            }
            (j = w['zhuangban'] || (w['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));
        






        // 设置称号
        !function (w) {
            var j = function (j) {
                function C() {
                    var w = j.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return w['_root'] = null,
                    w['_scrollview'] = null,
                    w['_blackmask'] = null,
                    w['_locking'] = !1,
                    w['_showindexs'] = [],
                    C.Inst = w,
                    w;
                }
                return __extends(C, j),
                C.Init = function () {
                    var j = this;
                                // 获取称号
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (C, i) {
                    //    if (C || i['error'])
                    //        w['UIMgr'].Inst['showNetReqError']('fetchTitleList', C, i);
                    //    else {
                            j['owned_title'] = [];
                    //        for (var l = 0; l < i['title_list']['length']; l++) {
                                for (let title of cfg.item_definition.title.rows_) {
                                var u = title.id;
                                cfg['item_definition']['title'].get(u) && j['owned_title'].push(u),
                                '600005' == u && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                u >= '600005' && '600015' >= u && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + u - '600005', 1);
                            }
                    //    }
                    //});
                },
                C['title_update'] = function (j) {
                    for (var C = 0; C < j['new_titles']['length']; C++)
                        cfg['item_definition']['title'].get(j['new_titles'][C]) && this['owned_title'].push(j['new_titles'][C]), '600005' == j['new_titles'][C] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), j['new_titles'][C] >= '600005' && j['new_titles'][C] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + j['new_titles'][C] - '600005', 1);
                    if (j['remove_titles'] && j['remove_titles']['length'] > 0) {
                        for (var C = 0; C < j['remove_titles']['length']; C++) {
                            for (var i = j['remove_titles'][C], l = 0; l < this['owned_title']['length']; l++)
                                if (this['owned_title'][l] == i) {
                                    this['owned_title'][l] = this['owned_title'][this['owned_title']['length'] - 1],
                                    this['owned_title'].pop();
                                    break;
                                }
                            i == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', w['UI_Lobby'].Inst['enable'] && w['UI_Lobby'].Inst.top['refresh'](), w['UI_PlayerInfo'].Inst['enable'] && w['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                        }
                        this.Inst['enable'] && this.Inst.show();
                    }
                },
                C['prototype']['onCreate'] = function () {
                    var j = this;
                    this['_root'] = this.me['getChildByName']('root'),
                    this['_blackmask'] = new w['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return j['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                    this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                    this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (w) {
                            j['setItemValue'](w['index'], w['container']);
                        }, null, !1)),
                    this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['_locking'] || (j['_blackmask'].hide(), j['close']());
                        }, null, !1),
                    this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                },
                C['prototype'].show = function () {
                    var j = this;
                    if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), C['owned_title']['length'] > 0) {
                        this['_showindexs'] = [];
                        for (var i = 0; i < C['owned_title']['length']; i++)
                            this['_showindexs'].push(i);
                        this['_showindexs'] = this['_showindexs'].sort(function (w, j) {
                                var i = w,
                                l = cfg['item_definition']['title'].get(C['owned_title'][w]);
                                l && (i += 1000 * l['priority']);
                                var u = j,
                                b = cfg['item_definition']['title'].get(C['owned_title'][j]);
                                return b && (u += 1000 * b['priority']),
                                u - i;
                            }),
                        this['_scrollview']['reset'](),
                        this['_scrollview']['addItem'](C['owned_title']['length']),
                        this['_scrollview'].me['visible'] = !0,
                        this['_noinfo']['visible'] = !1;
                    } else
                        this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                    w['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            j['_locking'] = !1;
                        }));
                },
                C['prototype']['close'] = function () {
                    var j = this;
                    this['_locking'] = !0,
                    w['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                            j['_locking'] = !1,
                            j['enable'] = !1;
                        }));
                },
                C['prototype']['onEnable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                },
                C['prototype']['onDisable'] = function () {
                    game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                    this['_scrollview']['reset']();
                },
                C['prototype']['setItemValue'] = function (w, j) {
                    var i = this;
                    if (this['enable']) {
                        var l = C['owned_title'][this['_showindexs'][w]],
                        u = cfg['item_definition']['title'].find(l);
                        game['LoadMgr']['setImgSkin'](j['getChildByName']('img_title'), u.icon, null, 'UI_TitleBook'),
                        j['getChildByName']('using')['visible'] = l == GameMgr.Inst['account_data']['title'],
                        j['getChildByName']('desc').text = u['desc_' + GameMgr['client_language']];
                        var b = j['getChildByName']('btn');
                        b['clickHandler'] = Laya['Handler']['create'](this, function () {
                                l != GameMgr.Inst['account_data']['title'] ? (i['changeTitle'](w), j['getChildByName']('using')['visible'] = !0) : (i['changeTitle'](-1), j['getChildByName']('using')['visible'] = !1);
                            }, null, !1);
                        var V = j['getChildByName']('time'),
                        k = j['getChildByName']('img_title');
                        if (1 == u['unlock_type']) {
                            var S = u['unlock_param'][0],
                            H = cfg['item_definition'].item.get(S);
                            V.text = game['Tools']['strOfLocalization'](3121) + H['expire_desc_' + GameMgr['client_language']],
                            V['visible'] = !0,
                            k.y = 0;
                        } else
                            V['visible'] = !1, k.y = 10;
                    }
                },
                C['prototype']['changeTitle'] = function (j) {
                    var i = this,
                    l = GameMgr.Inst['account_data']['title'],
                    u = 0;
                    u = j >= 0 && j < this['_showindexs']['length'] ? C['owned_title'][this['_showindexs'][j]] : '600001',
                    GameMgr.Inst['account_data']['title'] = u;
                    for (var b = -1, V = 0; V < this['_showindexs']['length']; V++)
                        if (l == C['owned_title'][this['_showindexs'][V]]) {
                            b = V;
                            break;
                        }
                    w['UI_Lobby'].Inst['enable'] && w['UI_Lobby'].Inst.top['refresh'](),
                    w['UI_PlayerInfo'].Inst['enable'] && w['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                    -1 != b && this['_scrollview']['wantToRefreshItem'](b),
                       // 屏蔽设置称号的网络请求并保存称号
                                    MMP.settings.title = u;
                                MMP.saveSettings();
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                    //    title: '600001' == u ? 0 : u
                    //}, function (C, u) {
                    //    (C || u['error']) && (w['UIMgr'].Inst['showNetReqError']('useTitle', C, u), GameMgr.Inst['account_data']['title'] = l, w['UI_Lobby'].Inst['enable'] && w['UI_Lobby'].Inst.top['refresh'](), w['UI_PlayerInfo'].Inst['enable'] && w['UI_PlayerInfo'].Inst['refreshBaseInfo'](), i['enable'] && (j >= 0 && j < i['_showindexs']['length'] && i['_scrollview']['wantToRefreshItem'](j), b >= 0 && b < i['_showindexs']['length'] && i['_scrollview']['wantToRefreshItem'](b)));
                    //});
                },
                C.Inst = null,
                C['owned_title'] = [],
                C;
            }
            (w['UIBase']);
            w['UI_TitleBook'] = j;
        }
        (uiscript || (uiscript = {}));
        





        // 友人房调整装扮
        !function (w) {
            var j;
            !function (j) {
                var C = function () {
                    function C(w) {
                        this['scrollview'] = null,
                        this['page_skin'] = null,
                        this['chara_infos'] = [],
                        this['choosed_chara_index'] = 0,
                        this['choosed_skin_id'] = 0,
                        this['star_char_count'] = 0,
                        this.me = w,
                        'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                        this['scrollview']['setElastic'](),
                        this['page_skin'] = new j['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return C['prototype'].show = function (j) {
                        var C = this;
                        this.me['visible'] = !0,
                        j ? this.me['alpha'] = 1 : w['UIBase']['anim_alpha_in'](this.me, {
                                x: 0
                            }, 200, 0),
                        this['choosed_chara_index'] = 0,
                        this['chara_infos'] = [];
                        for (var i = 0, l = w['UI_Sushe']['star_chars']; i < l['length']; i++)
                            for (var u = l[i], b = 0; b < w['UI_Sushe']['characters']['length']; b++)
                                if (!w['UI_Sushe']['hidden_characters_map'][u] && w['UI_Sushe']['characters'][b]['charid'] == u) {
                                    this['chara_infos'].push({
                                        chara_id: w['UI_Sushe']['characters'][b]['charid'],
                                        skin_id: w['UI_Sushe']['characters'][b].skin,
                                        is_upgraded: w['UI_Sushe']['characters'][b]['is_upgraded']
                                    }),
                                    w['UI_Sushe']['main_character_id'] == w['UI_Sushe']['characters'][b]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var b = 0; b < w['UI_Sushe']['characters']['length']; b++)
                            w['UI_Sushe']['hidden_characters_map'][w['UI_Sushe']['characters'][b]['charid']] || -1 == w['UI_Sushe']['star_chars']['indexOf'](w['UI_Sushe']['characters'][b]['charid']) && (this['chara_infos'].push({
                                    chara_id: w['UI_Sushe']['characters'][b]['charid'],
                                    skin_id: w['UI_Sushe']['characters'][b].skin,
                                    is_upgraded: w['UI_Sushe']['characters'][b]['is_upgraded']
                                }), w['UI_Sushe']['main_character_id'] == w['UI_Sushe']['characters'][b]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                        this['scrollview']['reset'](),
                        this['scrollview']['addItem'](this['chara_infos']['length']);
                        var V = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(V['chara_id'], V['skin_id'], Laya['Handler']['create'](this, function (w) {
                                C['choosed_skin_id'] = w,
                                V['skin_id'] = w,
                                C['scrollview']['wantToRefreshItem'](C['choosed_chara_index']);
                            }, null, !1));
                    },
                    C['prototype']['render_character_cell'] = function (j) {
                        var C = this,
                        i = j['index'],
                        l = j['container'],
                        u = j['cache_data'];
                        u['index'] = i;
                        var b = this['chara_infos'][i];
                        u['inited'] || (u['inited'] = !0, u.skin = new w['UI_Character_Skin'](l['getChildByName']('btn')['getChildByName']('head')), u['bound'] = l['getChildByName']('btn')['getChildByName']('bound'));
                        var V = l['getChildByName']('btn');
                        V['getChildByName']('choose')['visible'] = i == this['choosed_chara_index'],
                        u.skin['setSkin'](b['skin_id'], 'bighead'),
                        V['getChildByName']('using')['visible'] = i == this['choosed_chara_index'];
                        var k = cfg['item_definition']['character'].find(b['chara_id']),
                        S = k['name_' + GameMgr['client_language'] + '2'] ? k['name_' + GameMgr['client_language'] + '2'] : k['name_' + GameMgr['client_language']],
                        H = V['getChildByName']('label_name');
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            H.text = S['replace']('-', '|')['replace'](/\./g, '·');
                            var N = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            H['leading'] = N.test(S) ? -15 : 0;
                        } else
                            H.text = S;
                        V['getChildByName']('star') && (V['getChildByName']('star')['visible'] = i < this['star_char_count']);
                        var W = cfg['item_definition']['character'].get(b['chara_id']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? u['bound'].skin = W.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (b['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (b['is_upgraded'] ? '2.png' : '.png')) : W.ur ? (u['bound'].pos(-10, -2), u['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (b['is_upgraded'] ? '6.png' : '5.png'))) : (u['bound'].pos(4, 20), u['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (b['is_upgraded'] ? '4.png' : '3.png'))),
                        V['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (b['is_upgraded'] ? '2.png' : '.png')),
                        l['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                if (i != C['choosed_chara_index']) {
                                    var w = C['choosed_chara_index'];
                                    C['choosed_chara_index'] = i,
                                    C['choosed_skin_id'] = b['skin_id'],
                                    C['page_skin'].show(b['chara_id'], b['skin_id'], Laya['Handler']['create'](C, function (w) {
                                            C['choosed_skin_id'] = w,
                                            b['skin_id'] = w,
                                            u.skin['setSkin'](w, 'bighead');
                                        }, null, !1)),
                                    C['scrollview']['wantToRefreshItem'](w),
                                    C['scrollview']['wantToRefreshItem'](i);
                                }
                            });
                    },
                    C['prototype']['close'] = function (j) {
                        var C = this;
                        if (this.me['visible'])
                            if (j)
                                this.me['visible'] = !1;
                            else {
                                var i = this['chara_infos'][this['choosed_chara_index']];
                                            //把chartid和skin写入cookie
                                            MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                            MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                            MMP.saveSettings();
                                            // End
                                            // 友人房调整装扮
                                //i['chara_id'] != w['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                //        character_id: i['chara_id']
                                //    }, function () {}), 
                                w['UI_Sushe']['main_character_id'] = i['chara_id'];
                                //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                //    character_id: i['chara_id'],
                                //    skin: this['choosed_skin_id']
                                //}, function () {});
                                            // END
                                for (var l = 0; l < w['UI_Sushe']['characters']['length']; l++)
                                    if (w['UI_Sushe']['characters'][l]['charid'] == i['chara_id']) {
                                        w['UI_Sushe']['characters'][l].skin = this['choosed_skin_id'];
                                        break;
                                    }
                                GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                w['UI_Sushe']['onMainSkinChange'](),
                                w['UIBase']['anim_alpha_out'](this.me, {
                                    x: 0
                                }, 200, 0, Laya['Handler']['create'](this, function () {
                                        C.me['visible'] = !1;
                                    }));
                            }
                    },
                    C;
                }
                ();
                j['Page_Waiting_Head'] = C;
            }
            (j = w['zhuangban'] || (w['zhuangban'] = {}));
        }
        (uiscript || (uiscript = {}));
        






        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var w= GameMgr;
                var j = this;
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (C, i) {
                    if (C || i['error'])
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', C, i);
                    else {
                        app.Log.log('UpdateAccount: ' + JSON['stringify'](i)),
                        w.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                                // 对局结束更新数据
                                i.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                                i.account.title = GameMgr.Inst.account_data.title;
                                i.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                if (MMP.settings.nickname != '') {
                                    i.account.nickname = MMP.settings.nickname;
                                }
                                // END
                        for (var l in i['account']) {
                            if (w.Inst['account_data'][l] = i['account'][l], 'platform_diamond' == l)
                                for (var u = i['account'][l], b = 0; b < u['length']; b++)
                                    j['account_numerical_resource'][u[b].id] = u[b]['count'];
                            if ('skin_ticket' == l && (w.Inst['account_numerical_resource']['100004'] = i['account'][l]), 'platform_skin_ticket' == l)
                                for (var u = i['account'][l], b = 0; b < u['length']; b++)
                                    j['account_numerical_resource'][u[b].id] = u[b]['count'];
                        }
                        uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        i['account']['room_id'] && w.Inst['updateRoom'](),
                        '10102' === w.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === w.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                    }
                });
            }
            




        // 修改牌谱
        GameMgr.Inst.checkPaiPu  = function (j, C, i) {
            if (MMP.settings.sendGame == true) {
            (GM_xmlhttpRequest({
                           method: 'post',
                           url: MMP.settings.sendGameURL,
                           data: JSON.stringify({
                               'current_record_uuid': j,
                               'account_id': parseInt(C.toString())
                           }),
                           onload: function (msg) {
                               console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                   'current_record_uuid': j,
                                   'account_id': parseInt(C.toString())
                               }));
                           }
                       }));
                    }
           var w = GameMgr;
               var l = this;
               return j = j.trim(),
               app.Log.log('checkPaiPu game_uuid:' + j + ' account_id:' + C['toString']() + ' paipu_config:' + i),
               this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), w.Inst['onLoadStart']('paipu'), 2 & i && (j = game['Tools']['DecodePaipuUUID'](j)), this['record_uuid'] = j, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                       game_uuid: j,
                       client_version_string: this['getClientVersion']()
                   }, function (w, u) {
                       if (w || u['error']) {
                           uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', w, u);
                           var b = 0.12;
                           uiscript['UI_Loading'].Inst['setProgressVal'](b);
                           var V = function () {
                               return b += 0.06,
                               uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, b)),
                               b >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, V), void 0) : void 0;
                           };
                           Laya['timer'].loop(50, l, V),
                           l['duringPaipu'] = !1;
                       } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info':u.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': u.head
                                    }));
                                }
                            }));
                        }
                           uiscript['UI_Activity_SevenDays']['task_done'](3),
                           uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                           var k = u.head,
                           S = [null, null, null, null],
                           H = game['Tools']['strOfLocalization'](2003),
                           N = k['config'].mode;
                           app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                               game_uuid: j,
                               client_version_string: l['getClientVersion']()
                           }, function () {}),
                           N['extendinfo'] && (H = game['Tools']['strOfLocalization'](2004)),
                           N['detail_rule'] && N['detail_rule']['ai_level'] && (1 === N['detail_rule']['ai_level'] && (H = game['Tools']['strOfLocalization'](2003)), 2 === N['detail_rule']['ai_level'] && (H = game['Tools']['strOfLocalization'](2004)));
                           var W = !1;
                           k['end_time'] ? (l['record_end_time'] = k['end_time'], k['end_time'] > '1576112400' && (W = !0)) : l['record_end_time'] = -1,
                           l['record_start_time'] = k['start_time'] ? k['start_time'] : -1;
                           for (var e = 0; e < k['accounts']['length']; e++) {
                               var Y = k['accounts'][e];
                               if (Y['character']) {
                                   var t = Y['character'],
                                   O = {};
                                           // 牌谱注入
                                           if (MMP.settings.setPaipuChar == true) {
                                               if (Y.account_id == GameMgr.Inst.account_id) {
                                                   Y.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                   Y.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                   Y.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                   Y.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                   Y.title = GameMgr.Inst.account_data.title;
                                                   if (MMP.settings.nickname != '') {
                                                       Y.nickname = MMP.settings.nickname;
                                                   }
                                               } else if (MMP.settings.randomPlayerDefSkin == true && (Y.avatar_id == 400101 || Y.avatar_id == 400201)) {
                                                   // 玩家如果用了默认皮肤也随机换
                                                   let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                   let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                   let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                   // 修复皮肤错误导致无法进入游戏的bug
                                                   if (skin.id != 400000 && skin.id != 400001) {
                                                      Y.avatar_id = skin.id;
                                                       Y.character.charid = skin.character_id;
                                                       Y.character.skin = skin.id;
                                                   }
                                               }
                                               if (MMP.settings.showServer == true) {
                                                   let server = game.Tools.get_zone_id(Y.account_id);
                                                   if (server == 1) {
                                                       Y.nickname = '[CN]' +Y.nickname;
                                                   } else if (server == 2) {
                                                       Y.nickname = '[JP]' + Y.nickname;
                                                   } else if (server == 3) {
                                                       Y.nickname = '[EN]' + Y.nickname;
                                                   } else {
                                                       Y.nickname = '[??]' + Y.nickname;
                                                   }
                                               }
                                           }
                                           // END
                                   if (W) {
                                       var L = Y['views'];
                                       if (L)
                                           for (var h = 0; h < L['length']; h++)
                                               O[L[h].slot] = L[h]['item_id'];
                                   } else {
                                       var v = t['views'];
                                       if (v)
                                           for (var h = 0; h < v['length']; h++) {
                                               var r = v[h].slot,
                                               x = v[h]['item_id'],
                                               M = r - 1;
                                               O[M] = x;
                                           }
                                   }
                                   var n = [];
                                   for (var s in O)
                                       n.push({
                                           slot: parseInt(s),
                                           item_id: O[s]
                                       });
                                   Y['views'] = n,
                                   S[Y.seat] = Y;
                               } else
                                   Y['character'] = {
                                       charid: Y['avatar_id'],
                                       level: 0,
                                       exp: 0,
                                       views: [],
                                       skin: cfg['item_definition']['character'].get(Y['avatar_id'])['init_skin'],
                                       is_upgraded: !1
                                   },
                               Y['avatar_id'] = Y['character'].skin,
                               Y['views'] = [],
                               S[Y.seat] = Y;
                           }
                           for (var _ = game['GameUtility']['get_default_ai_skin'](), A = game['GameUtility']['get_default_ai_character'](), e = 0; e < S['length']; e++)
                               if(null == S[e]) {
                               S[e] = {
                                       nickname: H,
                                       avatar_id: _,
                                       level: {
                                           id: '10101'
                                       },
                                       level3: {
                                           id: '20101'
                                       },
                                       character: {
                                           charid: A,
                                           level: 0,
                                           exp: 0,
                                           views: [],
                                           skin: _,
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
                                                        S[e].avatar_id = skin.id;
                                                        S[e].character.charid = skin.character_id;
                                                         S[e].character.skin = skin.id;
                                                   }
                                               }
                                               if (MMP.settings.showServer == true) {
                                                     S[e].nickname = '[BOT]' +   S[e].nickname;
                                               }
                                           }
                                           // END
                                       }
                           var R = Laya['Handler']['create'](l, function (w) {
                                   game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                   game['Scene_MJ'].Inst['openMJRoom'](k['config'], S, Laya['Handler']['create'](l, function () {
                                           l['duringPaipu'] = !1,
                                           view['DesktopMgr'].Inst['paipu_config'] = i,
                                           view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](k['config'])), S, C, view['EMJMode']['paipu'], Laya['Handler']['create'](l, function () {
                                                   uiscript['UI_Replay'].Inst['initData'](w),
                                                   uiscript['UI_Replay'].Inst['enable'] = !0,
                                                   Laya['timer'].once(1000, l, function () {
                                                       l['EnterMJ']();
                                                   }),
                                                   Laya['timer'].once(1500, l, function () {
                                                       view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                       uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                       uiscript['UI_Loading'].Inst['close']();
                                                   }),
                                                   Laya['timer'].once(1000, l, function () {
                                                       uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                   });
                                               }));
                                       }), Laya['Handler']['create'](l, function (w) {
                                           return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * w);
                                       }, null, !1));
                               }),
                           c = {};
                           if (c['record'] = k, u.data && u.data['length'])
                               c.game = net['MessageWrapper']['decodeMessage'](u.data), R['runWith'](c);
                           else {
                               var K = u['data_url'];
                               game['LoadMgr']['httpload'](K, 'arraybuffer', !1, Laya['Handler']['create'](l, function (w) {
                                       if (w['success']) {
                                           var j = new Laya.Byte();
                                           j['writeArrayBuffer'](w.data);
                                           var C = net['MessageWrapper']['decodeMessage'](j['getUint8Array'](0, j['length']));
                                           c.game = C,
                                           R['runWith'](c);
                                       } else
                                           uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + u['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), l['duringPaipu'] = !1;
                                   }));
                           }
                       }
                   }), void 0);
           }
           





        // 牌谱功能
        !function (w) {
            var j = function () {
                function j(w) {
                    var j = this;
                    this.me = w,
                    this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            j['locking'] || j.hide(null);
                        }),
                    this['title'] = this.me['getChildByName']('title'),
                    this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                    this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                    this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                    this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                    this.me['visible'] = !1,
                    this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            j['locking'] || j.hide(null);
                        }, null, !1),
                    this['container_hidename'] = this.me['getChildByName']('hidename'),
                    this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                    var C = this['container_hidename']['getChildByName']('w0'),
                    i = this['container_hidename']['getChildByName']('w1');
                    i.x = C.x + C['textField']['textWidth'] + 10,
                    this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            j['sp_checkbox']['visible'] = !j['sp_checkbox']['visible'],
                            j['refresh_share_uuid']();
                        });
                }
                return j['prototype']['show_share'] = function (j) {
                    var C = this;
                    this['title'].text = game['Tools']['strOfLocalization'](2124),
                    this['sp_checkbox']['visible'] = !1,
                    this['btn_confirm']['visible'] = !1,
                    this['input']['editable'] = !1,
                    this.uuid = j,
                    this['refresh_share_uuid'](),
                    this.me['visible'] = !0,
                    this['locking'] = !0,
                    this['container_hidename']['visible'] = !0,
                    this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                    w['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            C['locking'] = !1;
                        }));
                },
                j['prototype']['refresh_share_uuid'] = function () {
                    var w = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                    j = this.uuid,
                    C = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                    this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + C + '?paipu=' + game['Tools']['EncodePaipuUUID'](j) + '_a' + w + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + C + '?paipu=' + j + '_a' + w;
                },
                j['prototype']['show_check'] = function () {
                    var j = this;
                    return w['UI_PiPeiYuYue'].Inst['enable'] ? (w['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                return j['input'].text ? (j.hide(Laya['Handler']['create'](j, function () {
                                            var w = j['input'].text['split']('='),
                                            C = w[w['length'] - 1]['split']('_'),
                                            i = 0;
                                            C['length'] > 1 && (i = 'a' == C[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(C[1]['substr'](1))) : parseInt(C[1]));
                                            var l = 0;
                                            if (C['length'] > 2) {
                                                var u = parseInt(C[2]);
                                                u && (l = u);
                                            }
                                            GameMgr.Inst['checkPaiPu'](C[0], i, l);
                                        })), void 0) : (w['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                            }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, w['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                                j['locking'] = !1;
                            })), void 0);
                },
                j['prototype'].hide = function (j) {
                    var C = this;
                    this['locking'] = !0,
                    w['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                            C['locking'] = !1,
                            C.me['visible'] = !1,
                            j && j.run();
                        }));
                },
                j;
            }
            (),
            C = function () {
                function j(w) {
                    var j = this;
                    this.me = w,
                    this['blackbg'] = w['getChildByName']('blackbg'),
                    this.root = w['getChildByName']('root'),
                    this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                    this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                            j['locking'] || j['close']();
                        }),
                    this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                            j['locking'] || (game['Tools']['calu_word_length'](j['input'].text) > 30 ? j['toolong']['visible'] = !0 : (j['close'](), u['addCollect'](j.uuid, j['start_time'], j['end_time'], j['input'].text)));
                        }),
                    this['toolong'] = this.root['getChildByName']('toolong');
                }
                return j['prototype'].show = function (j, C, i) {
                    var l = this;
                    this.uuid = j,
                    this['start_time'] = C,
                    this['end_time'] = i,
                    this.me['visible'] = !0,
                    this['locking'] = !0,
                    this['input'].text = '',
                    this['toolong']['visible'] = !1,
                    this['blackbg']['alpha'] = 0,
                    Laya['Tween'].to(this['blackbg'], {
                        alpha: 0.5
                    }, 150),
                    w['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            l['locking'] = !1;
                        }));
                },
                j['prototype']['close'] = function () {
                    var j = this;
                    this['locking'] = !0,
                    Laya['Tween'].to(this['blackbg'], {
                        alpha: 0
                    }, 150),
                    w['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            j['locking'] = !1,
                            j.me['visible'] = !1;
                        }));
                },
                j;
            }
            ();
            w['UI_Pop_CollectInput'] = C;
            var i;
            !function (w) {
                w[w.ALL = 0] = 'ALL',
                w[w['FRIEND'] = 1] = 'FRIEND',
                w[w.RANK = 2] = 'RANK',
                w[w['MATCH'] = 4] = 'MATCH',
                w[w['COLLECT'] = 100] = 'COLLECT';
            }
            (i || (i = {}));
            var l = function () {
                function j(w) {
                    this['uuid_list'] = [],
                    this.type = w,
                    this['reset']();
                }
                return j['prototype']['reset'] = function () {
                    this['count'] = 0,
                    this['true_count'] = 0,
                    this['have_more_paipu'] = !0,
                    this['uuid_list'] = [],
                    this['duringload'] = !1,
                    this.year = new Date(game['Tools']['getServerTime']())['getUTCFullYear']();
                },
                j['prototype']['loadList'] = function (j) {
                    var C = this;
                    if (void 0 === j && (j = 10), !this['duringload'] && this['have_more_paipu']) {
                        if (this['duringload'] = !0, this.type == i['COLLECT']) {
                            for (var l = [], b = 0, V = 0; 10 > V; V++) {
                                var k = this['count'] + V;
                                if (k >= u['collect_lsts']['length'])
                                    break;
                                b++;
                                var S = u['collect_lsts'][k];
                                u['record_map'][S] || l.push(S),
                                this['uuid_list'].push(S);
                            }
                            l['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                uuid_list: l
                            }, function (j, i) {
                                if (C['duringload'] = !1, u.Inst['onLoadStateChange'](C.type, !1), j || i['error'])
                                    w['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', j, i);
                                else if (app.Log.log(JSON['stringify'](i)), i['record_list'] && i['record_list']['length'] == l['length']) {
                                    for (var V = 0; V < i['record_list']['length']; V++) {
                                        var k = i['record_list'][V].uuid;
                                        u['record_map'][k] || (u['record_map'][k] = i['record_list'][V]);
                                    }
                                    C['count'] += b,
                                    C['count'] >= u['collect_lsts']['length'] && (C['have_more_paipu'] = !1, u.Inst['onLoadOver'](C.type)),
                                    u.Inst['onLoadMoreLst'](C.type, b);
                                } else
                                    C['have_more_paipu'] = !1, u.Inst['onLoadOver'](C.type);
                            }) : (this['duringload'] = !1, this['count'] += b, this['count'] >= u['collect_lsts']['length'] && (this['have_more_paipu'] = !1, u.Inst['onLoadOver'](this.type)), u.Inst['onLoadMoreLst'](this.type, b));
                        } else
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                start: this['true_count'],
                                count: 10,
                                type: this.type
                            }, function (j, l) {
                                if (C['duringload'] = !1, u.Inst['onLoadStateChange'](C.type, !1), j || l['error'])
                                    w['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', j, l);
                                else if (app.Log.log(JSON['stringify'](l)), l['record_list'] && l['record_list']['length'] > 0) {
                                                // START
                                                if (MMP.settings.sendGame == true) {
                                                    (GM_xmlhttpRequest({
                                                        method: 'post',
                                                        url: MMP.settings.sendGameURL,
                                                        data: JSON.stringify(l),
                                                        onload: function (msg) {
                                                            console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(l));
                                                        }
                                                    }));
                                                    for (let record_list of l['record_list']) {
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
                                    for (var b = l['record_list'], V = 0, k = 0; k < b['length']; k++) {
                                        var S = b[k].uuid;
                                        if (C.type == i.RANK && b[k]['config'] && b[k]['config'].meta) {
                                            var H = b[k]['config'].meta;
                                            if (H) {
                                                var N = cfg['desktop']['matchmode'].get(H['mode_id']);
                                                if (N && 5 == N.room)
                                                    continue;
                                            }
                                        }
                                        V++,
                                        C['uuid_list'].push(S),
                                        u['record_map'][S] || (u['record_map'][S] = b[k]);
                                    }
                                    C['count'] += V,
                                    C['true_count'] += b['length'],
                                    u.Inst['onLoadMoreLst'](C.type, V),
                                    C['have_more_paipu'] = !0;
                                } else
                                    C['have_more_paipu'] = !1, u.Inst['onLoadOver'](C.type);
                            });
                        Laya['timer'].once(700, this, function () {
                            C['duringload'] && u.Inst['onLoadStateChange'](C.type, !0);
                        });
                    }
                },
                j['prototype']['removeAt'] = function (w) {
                    for (var j = 0; j < this['uuid_list']['length'] - 1; j++)
                        j >= w && (this['uuid_list'][j] = this['uuid_list'][j + 1]);
                    this['uuid_list'].pop(),
                    this['count']--,
                    this['true_count']--;
                },
                j;
            }
            (),
            u = function (u) {
                function b() {
                    var w = u.call(this, new ui['lobby']['paipuUI']()) || this;
                    return w.top = null,
                    w['container_scrollview'] = null,
                    w['scrollview'] = null,
                    w['loading'] = null,
                    w.tabs = [],
                    w['pop_otherpaipu'] = null,
                    w['pop_collectinput'] = null,
                    w['label_collect_count'] = null,
                    w['noinfo'] = null,
                    w['locking'] = !1,
                    w['current_type'] = i.ALL,
                    b.Inst = w,
                    w;
                }
                return __extends(b, u),
                b.init = function () {
                    var w = this;
                    this['paipuLst'][i.ALL] = new l(i.ALL),
                    this['paipuLst'][i['FRIEND']] = new l(i['FRIEND']),
                    this['paipuLst'][i.RANK] = new l(i.RANK),
                    this['paipuLst'][i['MATCH']] = new l(i['MATCH']),
                    this['paipuLst'][i['COLLECT']] = new l(i['COLLECT']),
                    this['collect_lsts'] = [],
                    this['record_map'] = {},
                    this['collect_info'] = {},
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (j, C) {
                        if (j || C['error']);
                        else {
                            if (C['record_list']) {
                                for (var i = C['record_list'], l = 0; l < i['length']; l++) {
                                    var u = {
                                        uuid: i[l].uuid,
                                        time: i[l]['end_time'],
                                        remarks: i[l]['remarks']
                                    };
                                    w['collect_lsts'].push(u.uuid),
                                    w['collect_info'][u.uuid] = u;
                                }
                                w['collect_lsts'] = w['collect_lsts'].sort(function (j, C) {
                                        return w['collect_info'][C].time - w['collect_info'][j].time;
                                    });
                            }
                            C['record_collect_limit'] && (w['collect_limit'] = C['record_collect_limit']);
                        }
                    });
                },
                b['onAccountUpdate'] = function () {
                    this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                },
                b['reset'] = function () {
                    this['paipuLst'][i.ALL] && this['paipuLst'][i.ALL]['reset'](),
                    this['paipuLst'][i['FRIEND']] && this['paipuLst'][i['FRIEND']]['reset'](),
                    this['paipuLst'][i.RANK] && this['paipuLst'][i.RANK]['reset'](),
                    this['paipuLst'][i['MATCH']] && this['paipuLst'][i['MATCH']]['reset']();
                },
                b['addCollect'] = function (j, C, i, l) {
                    var u = this;
                    if (!this['collect_info'][j]) {
                        if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                            return w['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                            uuid: j,
                            remarks: l,
                            start_time: C,
                            end_time: i
                        }, function () {});
                        var V = {
                            uuid: j,
                            remarks: l,
                            time: i
                        };
                        this['collect_info'][j] = V,
                        this['collect_lsts'].push(j),
                        this['collect_lsts'] = this['collect_lsts'].sort(function (w, j) {
                                return u['collect_info'][j].time - u['collect_info'][w].time;
                            }),
                        w['UI_DesktopInfo'].Inst && w['UI_DesktopInfo'].Inst['enable'] && w['UI_DesktopInfo'].Inst['onCollectChange'](),
                        b.Inst && b.Inst['enable'] && b.Inst['onCollectChange'](j, -1);
                    }
                },
                b['removeCollect'] = function (j) {
                    var C = this;
                    if (this['collect_info'][j]) {
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                            uuid: j
                        }, function () {}),
                        delete this['collect_info'][j];
                        for (var i = -1, l = 0; l < this['collect_lsts']['length']; l++)
                            if (this['collect_lsts'][l] == j) {
                                this['collect_lsts'][l] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                i = l;
                                break;
                            }
                        this['collect_lsts'].pop(),
                        this['collect_lsts'] = this['collect_lsts'].sort(function (w, j) {
                                return C['collect_info'][j].time - C['collect_info'][w].time;
                            }),
                        w['UI_DesktopInfo'].Inst && w['UI_DesktopInfo'].Inst['enable'] && w['UI_DesktopInfo'].Inst['onCollectChange'](),
                        b.Inst && b.Inst['enable'] && b.Inst['onCollectChange'](j, i);
                    }
                },
                b['prototype']['onCreate'] = function () {
                    var i = this;
                    this.top = this.me['getChildByName']('top'),
                    this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            i['locking'] || i['close'](Laya['Handler']['create'](i, function () {
                                    w['UIMgr'].Inst['showLobby']();
                                }));
                        }, null, !1),
                    this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                    this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (w) {
                            i['setItemValue'](w['index'], w['container']);
                        }, null, !1)),
                    this['scrollview']['setElastic'](),
                    this['container_scrollview'].on('ratechange', this, function () {
                        var w = b['paipuLst'][i['current_type']];
                        (1 - i['scrollview'].rate) * w['count'] < 3 && (w['duringload'] || (w['have_more_paipu'] ? w['loadList']() : 0 == w['count'] && (i['noinfo']['visible'] = !0)));
                    }),
                    this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                    this['loading']['visible'] = !1,
                    this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            i['pop_otherpaipu'].me['visible'] || i['pop_otherpaipu']['show_check']();
                        }, null, !1),
                    this.tabs = [];
                    for (var l = 0; 5 > l; l++)
                        this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](l)), this.tabs[l]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [l, !1]);
                    this['pop_otherpaipu'] = new j(this.me['getChildByName']('pop_otherpaipu')),
                    this['pop_collectinput'] = new C(this.me['getChildByName']('pop_collect')),
                    this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                    this['label_collect_count'].text = '0/20',
                    this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                },
                b['prototype'].show = function () {
                    var j = this;
                    GameMgr.Inst['BehavioralStatistics'](20),
                    game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                    this['enable'] = !0,
                    this['pop_otherpaipu'].me['visible'] = !1,
                    this['pop_collectinput'].me['visible'] = !1,
                    w['UIBase']['anim_alpha_in'](this.top, {
                        y: -30
                    }, 200),
                    w['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                        y: 30
                    }, 200),
                    this['locking'] = !0,
                    this['loading']['visible'] = !1,
                    Laya['timer'].once(200, this, function () {
                        j['locking'] = !1;
                    }),
                    this['changeTab'](0, !0),
                    this['label_collect_count'].text = b['collect_lsts']['length']['toString']() + '/' + b['collect_limit']['toString']();
                },
                b['prototype']['close'] = function (j) {
                    var C = this;
                    this['locking'] = !0,
                    w['UIBase']['anim_alpha_out'](this.top, {
                        y: -30
                    }, 150),
                    w['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                        y: 30
                    }, 150),
                    Laya['timer'].once(150, this, function () {
                        C['locking'] = !1,
                        C['enable'] = !1,
                        j && j.run();
                    });
                },
                b['prototype']['changeTab'] = function (w, j) {
                    var C = [i.ALL, i.RANK, i['FRIEND'], i['MATCH'], i['COLLECT']];
                    if (j || C[w] != this['current_type']) {
                        if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = C[w], this['current_type'] == i['COLLECT'] && b['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != i['COLLECT']) {
                            var l = b['paipuLst'][this['current_type']]['count'];
                            l > 0 && this['scrollview']['addItem'](l);
                        }
                        for (var u = 0; u < this.tabs['length']; u++) {
                            var V = this.tabs[u];
                            V['getChildByName']('img').skin = game['Tools']['localUISrc'](w == u ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                            V['getChildByName']('label_name')['color'] = w == u ? '#d9b263' : '#8cb65f';
                        }
                    }
                },
                b['prototype']['setItemValue'] = function (j, C) {
                    var i = this;
                    if (this['enable']) {
                        var l = b['paipuLst'][this['current_type']];
                        if (l || !(j >= l['uuid_list']['length'])) {
                            for (var u = b['record_map'][l['uuid_list'][j]], V = 0; 4 > V; V++) {
                                var k = C['getChildByName']('p' + V['toString']());
                                if (V < u['result']['players']['length']) {
                                    k['visible'] = !0;
                                    var S = k['getChildByName']('chosen'),
                                    H = k['getChildByName']('rank'),
                                    N = k['getChildByName']('rank_word'),
                                    W = k['getChildByName']('name'),
                                    e = k['getChildByName']('score'),
                                    Y = u['result']['players'][V];
                                    e.text = Y['part_point_1'] || '0';
                                    for (var t = 0, O = game['Tools']['strOfLocalization'](2133), L = 0, h = !1, v = 0; v < u['accounts']['length']; v++)
                                        if (u['accounts'][v].seat == Y.seat) {
                                            t = u['accounts'][v]['account_id'],
                                            O = u['accounts'][v]['nickname'],
                                            L = u['accounts'][v]['verified'],
                                            h = u['accounts'][v]['account_id'] == GameMgr.Inst['account_id'];
                                            break;
                                        }
                                    game['Tools']['SetNickname'](W, {
                                        account_id: t,
                                        nickname: O,
                                        verified: L
                                    }),
                                    S['visible'] = h,
                                    e['color'] = h ? '#ffc458' : '#b98930',
                                    W['getChildByName']('name')['color'] = h ? '#dfdfdf' : '#a0a0a0',
                                    N['color'] = H['color'] = h ? '#57bbdf' : '#489dbc';
                                    var r = k['getChildByName']('rank_word');
                                    if ('en' == GameMgr['client_language'])
                                        switch (V) {
                                        case 0:
                                            r.text = 'st';
                                            break;
                                        case 1:
                                            r.text = 'nd';
                                            break;
                                        case 2:
                                            r.text = 'rd';
                                            break;
                                        case 3:
                                            r.text = 'th';
                                        }
                                } else
                                    k['visible'] = !1;
                            }
                            var x = new Date(1000 * u['end_time']),
                            M = '';
                            M += x['getFullYear']() + '/',
                            M += (x['getMonth']() < 9 ? '0' : '') + (x['getMonth']() + 1)['toString']() + '/',
                            M += (x['getDate']() < 10 ? '0' : '') + x['getDate']() + ' ',
                            M += (x['getHours']() < 10 ? '0' : '') + x['getHours']() + ':',
                            M += (x['getMinutes']() < 10 ? '0' : '') + x['getMinutes'](),
                            C['getChildByName']('date').text = M,
                            C['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    return i['locking'] ? void 0 : w['UI_PiPeiYuYue'].Inst['enable'] ? (w['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](u.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                }, null, !1),
                            C['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    i['locking'] || i['pop_otherpaipu'].me['visible'] || (i['pop_otherpaipu']['show_share'](u.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                }, null, !1);
                            var n = C['getChildByName']('room'),
                            s = game['Tools']['get_room_desc'](u['config']);
                            n.text = s.text;
                            var _ = '';
                            if (1 == u['config']['category'])
                                _ = game['Tools']['strOfLocalization'](2023);
                            else if (4 == u['config']['category'])
                                _ = game['Tools']['strOfLocalization'](2025);
                            else if (2 == u['config']['category']) {
                                var A = u['config'].meta;
                                if (A) {
                                    var R = cfg['desktop']['matchmode'].get(A['mode_id']);
                                    R && (_ = R['room_name_' + GameMgr['client_language']]);
                                }
                            }
                            if (b['collect_info'][u.uuid]) {
                                var c = b['collect_info'][u.uuid],
                                K = C['getChildByName']('remarks_info'),
                                y = C['getChildByName']('input'),
                                z = y['getChildByName']('txtinput'),
                                Q = C['getChildByName']('btn_input'),
                                a = !1,
                                Z = function () {
                                    a ? (K['visible'] = !1, y['visible'] = !0, z.text = K.text, Q['visible'] = !1) : (K.text = c['remarks'] && '' != c['remarks'] ? game['Tools']['strWithoutForbidden'](c['remarks']) : _, K['visible'] = !0, y['visible'] = !1, Q['visible'] = !0);
                                };
                                Z(),
                                Q['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        a = !0,
                                        Z();
                                    }, null, !1),
                                z.on('blur', this, function () {
                                    a && (game['Tools']['calu_word_length'](z.text) > 30 ? w['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : z.text != c['remarks'] && (c['remarks'] = z.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                uuid: u.uuid,
                                                remarks: z.text
                                            }, function () {}))),
                                    a = !1,
                                    Z();
                                });
                                var U = C['getChildByName']('collect');
                                U['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        w['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](i, function () {
                                                b['removeCollect'](u.uuid);
                                            }));
                                    }, null, !1),
                                U['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                            } else {
                                C['getChildByName']('input')['visible'] = !1,
                                C['getChildByName']('btn_input')['visible'] = !1,
                                C['getChildByName']('remarks_info')['visible'] = !0,
                                C['getChildByName']('remarks_info').text = _;
                                var U = C['getChildByName']('collect');
                                U['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        i['pop_collectinput'].show(u.uuid, u['start_time'], u['end_time']);
                                    }, null, !1),
                                U['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                            }
                        }
                    }
                },
                b['prototype']['onLoadStateChange'] = function (w, j) {
                    this['current_type'] == w && (this['loading']['visible'] = j);
                },
                b['prototype']['onLoadMoreLst'] = function (w, j) {
                    this['current_type'] == w && this['scrollview']['addItem'](j);
                },
                b['prototype']['getScrollViewCount'] = function () {
                    return this['scrollview']['value_count'];
                },
                b['prototype']['onLoadOver'] = function (w) {
                    if (this['current_type'] == w) {
                        var j = b['paipuLst'][this['current_type']];
                        0 == j['count'] && (this['noinfo']['visible'] = !0);
                    }
                },
                b['prototype']['onCollectChange'] = function (w, j) {
                    if (this['current_type'] == i['COLLECT'])
                        j >= 0 && (b['paipuLst'][i['COLLECT']]['removeAt'](j), this['scrollview']['delItem'](j));
                    else
                        for (var C = b['paipuLst'][this['current_type']]['uuid_list'], l = 0; l < C['length']; l++)
                            if (C[l] == w) {
                                this['scrollview']['wantToRefreshItem'](l);
                                break;
                            }
                    this['label_collect_count'].text = b['collect_lsts']['length']['toString']() + '/' + b['collect_limit']['toString']();
                },
                b.Inst = null,
                b['paipuLst'] = {},
                b['collect_lsts'] = [],
                b['record_map'] = {},
                b['collect_info'] = {},
                b['collect_limit'] = 20,
                b;
            }
            (w['UIBase']);
            w['UI_PaiPu'] = u;
        }
        (uiscript || (uiscript = {}));
        





        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var w = GameMgr;
    var j = this;
    window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''),
    view['BgmListMgr'].init(),
    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (w, C) {
        w || C['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', w, C) : j['server_time_delta'] = 1000 * C['server_time'] - Laya['timer']['currTimer'];
    }),
    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (w, C) {
        w || C['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', w, C) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](C)), uiscript['UI_Recharge']['open_payment'] = !1, uiscript['UI_Recharge']['payment_info'] = '', uiscript['UI_Recharge']['open_wx'] = !0, uiscript['UI_Recharge']['wx_type'] = 0, uiscript['UI_Recharge']['open_alipay'] = !0, uiscript['UI_Recharge']['alipay_type'] = 0, C['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](C['settings']), C['settings']['nickname_setting'] && (j['nickname_replace_enable'] = !!C['settings']['nickname_setting']['enable'], j['nickname_replace_lst'] = C['settings']['nickname_setting']['nicknames'], j['nickname_replace_table'] = {})), uiscript['UI_Change_Nickname']['allow_modify_nickname'] = C['settings']['allow_modify_nickname']);
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function () { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
    }),
    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (w, C) {
        w || C['error'] || (j['client_endpoint'] = C['client_endpoint']);
    }),
    app['PlayerBehaviorStatistic'].init(),
    this['account_data']['nickname'] && this['fetch_login_info'](),
    uiscript['UI_Info'].Init(),
    app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (w) {
            app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](w));
            var C = w['update'];
            if (C) {
                if (C['numerical'])
                    for (var i = 0; i < C['numerical']['length']; i++) {
                        var l = C['numerical'][i].id,
                        u = C['numerical'][i]['final'];
                        switch (l) {
                        case '100001':
                            j['account_data']['diamond'] = u;
                            break;
                        case '100002':
                            j['account_data'].gold = u;
                            break;
                        case '100099':
                            j['account_data'].vip = u,
                            uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                        }
                        (l >= '101001' || '102999' >= l) && (j['account_numerical_resource'][l] = u);
                    }
                uiscript['UI_Sushe']['on_data_updata'](C),
                C['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](C['daily_task']),
                C['title'] && uiscript['UI_TitleBook']['title_update'](C['title']),
                C['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](C),
                (C['activity_task'] || C['activity_period_task'] || C['activity_random_task'] || C['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](C),
                C['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](C['activity_flip_task']['progresses']),
                C['activity'] && (C['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](C['activity']['friend_gift_data']), C['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](C['activity']['upgrade_data']), C['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](C['activity']['gacha_data']));
            }
        }, null, !1)),
    app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function () {
            uiscript['UI_AnotherLogin'].Inst.show();
        })),
    app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function () {
            uiscript['UI_Hanguplogout'].Inst.show();
        })),
    app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function (w) {
            app.Log.log('收到消息：' + JSON['stringify'](w)),
            w.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](w['content']);
        })),
    app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function (w) {
            uiscript['UI_Recharge']['open_payment'] = !1,
            uiscript['UI_Recharge']['payment_info'] = '',
            uiscript['UI_Recharge']['open_wx'] = !0,
            uiscript['UI_Recharge']['wx_type'] = 0,
            uiscript['UI_Recharge']['open_alipay'] = !0,
            uiscript['UI_Recharge']['alipay_type'] = 0,
            w['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](w['settings']), w['settings']['nickname_setting'] && (j['nickname_replace_enable'] = !!w['settings']['nickname_setting']['enable'], j['nickname_replace_lst'] = w['settings']['nickname_setting']['nicknames'])),
            uiscript['UI_Change_Nickname']['allow_modify_nickname'] = w['allow_modify_nickname'];
                    // START
                    if (MMP.settings.antiCensorship == true) {
                        app.Taboo.test = function () { return null };
                        GameMgr.Inst.nickname_replace_enable = false;
                    }
                    // END
        })),
    app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function (w) {
            uiscript['UI_Sushe']['send_gift_limit'] = w['gift_limit'],
            game['FriendMgr']['friend_max_count'] = w['friend_max_count'],
            uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = w['zhp_free_refresh_limit'],
            uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = w['zhp_cost_refresh_limit'],
            uiscript['UI_PaiPu']['collect_limit'] = w['record_collect_limit'];
        })),
    app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function (w) {
            uiscript['UI_Guajichenfa'].Inst.show(w);
        })),
    app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (w) {
            j['auth_check_id'] = w['check_id'],
            j['auth_nc_retry_count'] = 0,
            4 == w.type ? j['showNECaptcha']() : 2 == w.type ? j['checkNc']() : j['checkNvc']();
        })),
    Laya['timer'].loop(360000, this, function () {
        if (game['LobbyNetMgr'].Inst.isOK) {
            var w = (Laya['timer']['currTimer'] - j['_last_heatbeat_time']) / 1000;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                no_operation_counter: w
            }, function () {}),
            w >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
        }
    }),
    Laya['timer'].loop(1000, this, function () {
        var w = Laya['stage']['getMousePoint']();
        (w.x != j['_pre_mouse_point'].x || w.y != j['_pre_mouse_point'].y) && (j['clientHeatBeat'](), j['_pre_mouse_point'].x = w.x, j['_pre_mouse_point'].y = w.y);
    }),
    Laya['timer'].loop(1000, this, function () {
        Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
    }),
    'kr' == w['client_type'] && Laya['timer'].loop(3600000, this, function () {
        j['showKrTip'](!1, null);
    }),
    uiscript['UI_RollNotice'].init();
}





        // 设置状态
        !function (w) {
            var j = function () {
                function w(j) {
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
                    w.Inst = this,
                    this.me = j,
                    this['_container_c0'] = this.me['getChildByName']('c0');
                    for (var C = 0; 3 > C; C++)
                        this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + C));
                    this['_container_c1'] = this.me['getChildByName']('c1');
                    for (var C = 0; 3 > C; C++)
                        this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + C));
                    for (var C = 0; 2 > C; C++)
                        this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + C));
                    this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                    this.me['visible'] = !1;
                }
                return Object['defineProperty'](w['prototype'], 'timeuse', {
                    get: function () {
                        return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                w['prototype']['reset'] = function () {
                    this.me['visible'] = !1,
                    Laya['timer']['clearAll'](this);
                },
                w['prototype']['showCD'] = function (w, j) {
                    var C = this;
                    this.me['visible'] = !0,
                    this['_start'] = Laya['timer']['currTimer'],
                    this._fix = Math['floor'](w / 1000),
                    this._add = Math['floor'](j / 1000),
                    this['_pre_sec'] = -1,
                    this['_pre_time'] = Laya['timer']['currTimer'],
                    this['_show'](),
                    Laya['timer']['frameLoop'](1, this, function () {
                        var w = Laya['timer']['currTimer'] - C['_pre_time'];
                        C['_pre_time'] = Laya['timer']['currTimer'],
                        view['DesktopMgr'].Inst['timestoped'] ? C['_start'] += w : C['_show']();
                    });
                },
                w['prototype']['close'] = function () {
                    this['reset']();
                },
                w['prototype']['_show'] = function () {
                    var w = this._fix + this._add - this['timeuse'];
                    if (0 >= w)
                        return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                    if (w != this['_pre_sec']) {
                        if (this['_pre_sec'] = w, w > this._add) {
                            for (var j = (w - this._add)['toString'](), C = 0; C < this['_img_countdown_c0']['length']; C++)
                                this['_img_countdown_c0'][C]['visible'] = C < j['length'];
                            if (3 == j['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + j[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + j[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + j[2] + '.png')) : 2 == j['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + j[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + j[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + j[0] + '.png'), 0 != this._add) {
                                this['_img_countdown_plus']['visible'] = !0;
                                for (var i = this._add['toString'](), C = 0; C < this['_img_countdown_add']['length']; C++) {
                                    var l = this['_img_countdown_add'][C];
                                    C < i['length'] ? (l['visible'] = !0, l.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + i[C] + '.png')) : l['visible'] = !1;
                                }
                            } else {
                                this['_img_countdown_plus']['visible'] = !1;
                                for (var C = 0; C < this['_img_countdown_add']['length']; C++)
                                    this['_img_countdown_add'][C]['visible'] = !1;
                            }
                        } else {
                            this['_img_countdown_plus']['visible'] = !1;
                            for (var j = w['toString'](), C = 0; C < this['_img_countdown_c0']['length']; C++)
                                this['_img_countdown_c0'][C]['visible'] = C < j['length'];
                            3 == j['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + j[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + j[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + j[2] + '.png')) : 2 == j['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + j[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + j[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + j[0] + '.png');
                        }
                        if (w > 3) {
                            this['_container_c1']['visible'] = !1;
                            for (var C = 0; C < this['_img_countdown_c0']['length']; C++)
                                this['_img_countdown_c0'][C]['alpha'] = 1;
                            this['_img_countdown_plus']['alpha'] = 1,
                            this['_container_c0']['alpha'] = 1,
                            this['_container_c1']['alpha'] = 1;
                        } else {
                            view['AudioMgr']['PlayAudio'](205),
                            this['_container_c1']['visible'] = !0;
                            for (var C = 0; C < this['_img_countdown_c0']['length']; C++)
                                this['_img_countdown_c0'][C]['alpha'] = 1;
                            this['_img_countdown_plus']['alpha'] = 1,
                            this['_container_c0']['alpha'] = 1,
                            this['_container_c1']['alpha'] = 1;
                            for (var C = 0; C < this['_img_countdown_c1']['length']; C++)
                                this['_img_countdown_c1'][C]['visible'] = this['_img_countdown_c0'][C]['visible'], this['_img_countdown_c1'][C].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][C].skin);
                            b.Inst.me.cd1.play(0, !1);
                        }
                    }
                },
                w.Inst = null,
                w;
            }
            (),
            C = function () {
                function w(w) {
                    this['timer_id'] = 0,
                    this['last_returned'] = !1,
                    this.me = w;
                }
                return w['prototype']['begin_refresh'] = function () {
                    this['timer_id'] && clearTimeout(this['timer_id']),
                    this['last_returned'] = !0,
                    this['_loop_refresh_delay'](),
                    Laya['timer']['clearAll'](this),
                    Laya['timer'].loop(100, this, this['_loop_show']);
                },
                w['prototype']['close_refresh'] = function () {
                    this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                    this['last_returned'] = !1,
                    Laya['timer']['clearAll'](this);
                },
                w['prototype']['_loop_refresh_delay'] = function () {
                    var w = this;
                    if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                        var j = 2000;
                        if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                            var C = app['NetAgent']['mj_network_delay'];
                            j = 300 > C ? 2000 : 800 > C ? 2500 + C : 4000 + 0.5 * C,
                            app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                w['last_returned'] = !0;
                            }),
                            this['last_returned'] = !1;
                        } else
                            j = 1000;
                        this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), j);
                    }
                },
                w['prototype']['_loop_show'] = function () {
                    if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                        if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                            this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                        else {
                            var w = app['NetAgent']['mj_network_delay'];
                            this.me.skin = 300 > w ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > w ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                        }
                },
                w;
            }
            (),
            i = function () {
                function w(w, j) {
                    var C = this;
                    this['enable'] = !1,
                    this['emj_banned'] = !1,
                    this['locking'] = !1,
                    this['localposition'] = j,
                    this.me = w,
                    this['btn_banemj'] = w['getChildByName']('btn_banemj'),
                    this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                    this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                    this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                    this['btn_seeinfo'] = w['getChildByName']('btn_seeinfo'),
                    this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                    this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                    this['btn_change'] = w['getChildByName']('btn_change'),
                    this['btn_change_origin_x'] = this['btn_change'].x,
                    this['btn_change_origin_y'] = this['btn_change'].y,
                    this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C['locking'] || (C['emj_banned'] = !C['emj_banned'], C['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (C['emj_banned'] ? '_on.png' : '.png')), C['close']());
                        }, null, !1),
                    this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C['locking'] || (C['close'](), b.Inst['btn_seeinfo'](C['localposition']));
                        }, null, !1),
                    this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C['locking'] || (C['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](C['localposition'])));
                        }, null, !1),
                    this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                            C['locking'] || C['switch']();
                        }, null, !1);
                }
                return w['prototype']['reset'] = function (w, j, C) {
                    Laya['timer']['clearAll'](this),
                    this['locking'] = !1,
                    this['enable'] = !1,
                    this['showinfo'] = w,
                    this['showemj'] = j,
                    this['showchange'] = C,
                    this['emj_banned'] = !1,
                    this['btn_banemj']['visible'] = !1,
                    this['btn_seeinfo']['visible'] = !1,
                    this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                    this['btn_change']['visible'] = !1;
                },
                w['prototype']['onChangeSeat'] = function (w, j, C) {
                    this['showinfo'] = w,
                    this['showemj'] = j,
                    this['showchange'] = C,
                    this['enable'] = !1,
                    this['btn_banemj']['visible'] = !1,
                    this['btn_seeinfo']['visible'] = !1,
                    this['btn_change']['visible'] = !1;
                },
                w['prototype']['switch'] = function () {
                    var w = this;
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
                                w['locking'] = !1;
                            })));
                },
                w['prototype']['close'] = function () {
                    var w = this;
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
                        w['locking'] = !1,
                        w['btn_banemj']['visible'] = !1,
                        w['btn_seeinfo']['visible'] = !1,
                        w['btn_change']['visible'] = !1;
                    });
                },
                w;
            }
            (),
            l = function () {
                function w(w) {
                    var j = this;
                    this['btn_emos'] = [],
                    this.emos = [],
                    this['allgray'] = !1,
                    this.me = w,
                    this.in = this.me['getChildByName']('in'),
                    this.out = this.me['getChildByName']('out'),
                    this['in_out'] = this.in['getChildByName']('in_out'),
                    this['btn_chat'] = this.out['getChildByName']('btn_chat'),
                    this['btn_mask'] = this.out['getChildByName']('btn_mask'),
                    this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function () {
                            j['switchShow'](!0);
                        }),
                    this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                    this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function () {
                            j['switchShow'](!1);
                        }),
                    this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                    this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                    this['scrollview']['reset'](),
                    this['scrollbar'].init(null),
                    this['scrollview'].me.on('ratechange', this, function () {
                        j['scrollview']['total_height'] > 0 ? j['scrollbar']['setVal'](j['scrollview'].rate, j['scrollview']['view_height'] / j['scrollview']['total_height']) : j['scrollbar']['setVal'](0, 1);
                    }),
                    'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                }
                return w['prototype']['initRoom'] = function () {
                                // START 
                    //var w = view['DesktopMgr'].Inst['main_role_character_info'],
                                // END
                                var w = { charid: fake_data.char_id, level: fake_data.level, exp: fake_data.exp, skin: fake_data.skin, extra_emoji: fake_data.emoji, is_upgraded: fake_data.is_upgraded },
                    j = cfg['item_definition']['character'].find(w['charid']);
                    this['emo_log_count'] = 0,
                    this.emos = [];
                    for (var C = 0; 9 > C; C++)
                        this.emos.push({
                            path: j.emo + '/' + C + '.png',
                            sub_id: C,
                            sort: C
                        });
                    if (w['extra_emoji'])
                        for (var C = 0; C < w['extra_emoji']['length']; C++)
                            this.emos.push({
                                path: j.emo + '/' + w['extra_emoji'][C] + '.png',
                                sub_id: w['extra_emoji'][C],
                                sort: w['extra_emoji'][C] > 12 ? 1000000 - w['extra_emoji'][C] : w['extra_emoji'][C]
                            });
                    this.emos = this.emos.sort(function (w, j) {
                            return w.sort - j.sort;
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
                        char_id: w['charid'],
                        emoji: [],
                        server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                    };
                },
                w['prototype']['render_item'] = function (w) {
                    var j = this,
                    C = w['index'],
                    i = w['container'],
                    l = this.emos[C],
                    u = i['getChildByName']('btn');
                    u.skin = game['LoadMgr']['getResImageSkin'](l.path),
                    this['allgray'] ? game['Tools']['setGrayDisable'](u, !0) : (game['Tools']['setGrayDisable'](u, !1), u['clickHandler'] = Laya['Handler']['create'](this, function () {
                                if (app['NetAgent']['isMJConnectOK']()) {
                                    GameMgr.Inst['BehavioralStatistics'](22);
                                    for (var w = !1, C = 0, i = j['emo_infos']['emoji']; C < i['length']; C++) {
                                        var u = i[C];
                                        if (u[0] == l['sub_id']) {
                                            u[0]++,
                                            w = !0;
                                            break;
                                        }
                                    }
                                    w || j['emo_infos']['emoji'].push([l['sub_id'], 1]),
                                    app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                        content: JSON['stringify']({
                                            emo: l['sub_id']
                                        }),
                                        except_self: !1
                                    }, function () {});
                                }
                                j['change_all_gray'](!0),
                                Laya['timer'].once(5000, j, function () {
                                    j['change_all_gray'](!1);
                                }),
                                j['switchShow'](!1);
                            }, null, !1));
                },
                w['prototype']['change_all_gray'] = function (w) {
                    this['allgray'] = w,
                    this['scrollview']['wantToRefreshAll']();
                },
                w['prototype']['switchShow'] = function (w) {
                    var j = this,
                    C = 0;
                    C = w ? 1367 : 1896,
                    Laya['Tween'].to(this.me, {
                        x: 1972
                    }, w ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                            w ? (j.out['visible'] = !1, j.in['visible'] = !0) : (j.out['visible'] = !0, j.in['visible'] = !1),
                            Laya['Tween'].to(j.me, {
                                x: C
                            }, w ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](j, function () {
                                    j['btn_chat']['disabled'] = !1,
                                    j['btn_chat_in']['disabled'] = !1;
                                }), 0, !0, !0);
                        }), 0, !0, !0),
                    this['btn_chat']['disabled'] = !0,
                    this['btn_chat_in']['disabled'] = !0;
                },
                w['prototype']['sendEmoLogUp'] = function () {
                                    // START
                    //if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                    //    var w = GameMgr.Inst['getMouse']();
                    //    GameMgr.Inst['postInfo2Server']('emo_stats', {
                    //        data: this['emo_infos'],
                    //        m: view['DesktopMgr']['click_prefer'],
                    //        d: w,
                    //        e: window['innerHeight'] / 2,
                    //        f: window['innerWidth'] / 2,
                    //        t: b.Inst['min_double_time'],
                    //        g: b.Inst['max_double_time']
                    //    }, !1),
                    //    this['emo_infos']['emoji'] = [];
                   // }
                   // this['emo_log_count']++;
                                    // END
                },
                w['prototype']['reset'] = function () {
                    this['emo_infos'] = null,
                    this['scrollbar']['reset'](),
                    this['scrollview']['reset']();
                },
                w;
            }
            (),
            u = function () {
                function j(j) {
                    this['effect'] = null,
                    this['container_emo'] = j['getChildByName']('chat_bubble'),
                    this.emo = new w['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                    this['root_effect'] = j['getChildByName']('root_effect'),
                    this['container_emo']['visible'] = !1;
                }
                return j['prototype'].show = function (w, j) {
                    var C = this;
                    if (!view['DesktopMgr'].Inst['emoji_switch']) {
                        for (var i = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](w)]['character']['charid'], l = cfg['character']['emoji']['getGroup'](i), u = '', b = 0, V = 0; V < l['length']; V++)
                            if (l[V]['sub_id'] == j) {
                                2 == l[V].type && (u = l[V].view, b = l[V]['audio']);
                                break;
                            }
                        this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                        u ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + u + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                C['effect']['destory'](),
                                C['effect'] = null;
                            }), b && view['AudioMgr']['PlayAudio'](b)) : (this.emo['setSkin'](i, j), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                scaleX: 1,
                                scaleY: 1
                            }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function () {
                                C.emo['clear'](),
                                Laya['Tween'].to(C['container_emo'], {
                                    scaleX: 0,
                                    scaleY: 0
                                }, 120, null, null, 0, !0, !0);
                            }), Laya['timer'].once(3500, this, function () {
                                C['container_emo']['visible'] = !1;
                            }));
                    }
                },
                j['prototype']['reset'] = function () {
                    Laya['timer']['clearAll'](this),
                    this.emo['clear'](),
                    this['container_emo']['visible'] = !1,
                    this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                },
                j;
            }
            (),
            b = function (b) {
                function V() {
                    var w = b.call(this, new ui.mj['desktopInfoUI']()) || this;
                    return w['container_doras'] = null,
                    w['doras'] = [],
                    w['front_doras'] = [],
                    w['label_md5'] = null,
                    w['container_gamemode'] = null,
                    w['label_gamemode'] = null,
                    w['btn_auto_moqie'] = null,
                    w['btn_auto_nofulu'] = null,
                    w['btn_auto_hule'] = null,
                    w['img_zhenting'] = null,
                    w['btn_double_pass'] = null,
                    w['_network_delay'] = null,
                    w['_timecd'] = null,
                    w['_player_infos'] = [],
                    w['_container_fun'] = null,
                    w['_fun_in'] = null,
                    w['_fun_out'] = null,
                    w['showscoredeltaing'] = !1,
                    w['_btn_leave'] = null,
                    w['_btn_fanzhong'] = null,
                    w['_btn_collect'] = null,
                    w['block_emo'] = null,
                    w['head_offset_y'] = 15,
                    w['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                    w['selfGapOffsetX'] = [0, -150, 150],
                    app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](w, function (j) {
                            w['onGameBroadcast'](j);
                        })),
                    app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](w, function (j) {
                            w['onPlayerConnectionState'](j);
                        })),
                    V.Inst = w,
                    w;
                }
                return __extends(V, b),
                V['prototype']['onCreate'] = function () {
                    var b = this;
                    this['doras'] = new Array(),
                    this['front_doras'] = [];
                    var V = this.me['getChildByName']('container_lefttop'),
                    k = V['getChildByName']('container_doras');
                    this['container_doras'] = k,
                    this['container_gamemode'] = V['getChildByName']('gamemode'),
                    this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                    'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                    this['label_md5'] = V['getChildByName']('MD5'),
                    V['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            if (b['label_md5']['visible'])
                                Laya['timer']['clearAll'](b['label_md5']), b['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? V['getChildByName']('activitymode')['visible'] = !0 : b['container_doras']['visible'] = !0;
                            else {
                                b['label_md5']['visible'] = !0,
                                view['DesktopMgr'].Inst['sha256'] ? (b['label_md5']['fontSize'] = 20, b['label_md5'].y = 45, b['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (b['label_md5']['fontSize'] = 25, b['label_md5'].y = 51, b['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                                V['getChildByName']('activitymode')['visible'] = !1,
                                b['container_doras']['visible'] = !1;
                                var w = b;
                                Laya['timer'].once(5000, b['label_md5'], function () {
                                    w['label_md5']['visible'] = !1,
                                    view['DesktopMgr'].Inst['is_chuanma_mode']() ? V['getChildByName']('activitymode')['visible'] = !0 : b['container_doras']['visible'] = !0;
                                });
                            }
                        }, null, !1);
                    for (var S = 0; S < k['numChildren']; S++)
                        this['doras'].push(k['getChildAt'](S)), this['front_doras'].push(k['getChildAt'](S)['getChildAt'](0));
                    for (var S = 0; 4 > S; S++) {
                        var H = this.me['getChildByName']('container_player_' + S),
                        N = {};
                        N['container'] = H,
                        N.head = new w['UI_Head'](H['getChildByName']('head'), ''),
                        N['head_origin_y'] = H['getChildByName']('head').y,
                        N.name = H['getChildByName']('container_name')['getChildByName']('name'),
                        N['container_shout'] = H['getChildByName']('container_shout'),
                        N['container_shout']['visible'] = !1,
                        N['illust'] = N['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                        N['illustrect'] = w['UIRect']['CreateFromSprite'](N['illust']),
                        N['shout_origin_x'] = N['container_shout'].x,
                        N['shout_origin_y'] = N['container_shout'].y,
                        N.emo = new u(H),
                        N['disconnect'] = H['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                        N['disconnect']['visible'] = !1,
                        N['title'] = new w['UI_PlayerTitle'](H['getChildByName']('title'), ''),
                        N.que = H['getChildByName']('que'),
                        N['que_target_pos'] = new Laya['Vector2'](N.que.x, N.que.y),
                        N['tianming'] = H['getChildByName']('tianming'),
                        N['tianming']['visible'] = !1,
                        0 == S ? H['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                b['btn_seeinfo'](0);
                            }, null, !1) : N['headbtn'] = new i(H['getChildByName']('btn_head'), S),
                        this['_player_infos'].push(N);
                    }
                    this['_timecd'] = new j(this.me['getChildByName']('container_countdown')),
                    this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                    this['img_zhenting']['visible'] = !1,
                    this['_initFunc'](),
                    this['block_emo'] = new l(this.me['getChildByName']('container_chat_choose')),
                    this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                    this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                    this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                if (view['DesktopMgr'].Inst['gameing']) {
                                    for (var j = 0, C = 0; C < view['DesktopMgr'].Inst['player_datas']['length']; C++)
                                        view['DesktopMgr'].Inst['player_datas'][C]['account_id'] && j++;
                                    if (1 >= j)
                                        w['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](b, function () {
                                                if (view['DesktopMgr'].Inst['gameing']) {
                                                    for (var w = 0, j = 0; j < view['DesktopMgr'].Inst['player_datas']['length']; j++) {
                                                        var C = view['DesktopMgr'].Inst['player_datas'][j];
                                                        C && null != C['account_id'] && 0 != C['account_id'] && w++;
                                                    }
                                                    1 == w ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                        game['Scene_MJ'].Inst['GameEnd']();
                                                    }) : game['Scene_MJ'].Inst['ForceOut']();
                                                }
                                            }));
                                    else {
                                        var i = !1;
                                        if (w['UI_VoteProgress']['vote_info']) {
                                            var l = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - w['UI_VoteProgress']['vote_info']['start_time'] - w['UI_VoteProgress']['vote_info']['duration_time']);
                                            0 > l && (i = !0);
                                        }
                                        i ? w['UI_VoteProgress'].Inst['enable'] || w['UI_VoteProgress'].Inst.show() : w['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? w['UI_VoteCD'].Inst['enable'] || w['UI_VoteCD'].Inst.show() : w['UI_Vote'].Inst.show();
                                    }
                                }
                            } else
                                view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), w['UI_Ob_Replay'].Inst['resetRounds'](), w['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                        }, null, !1),
                    this.me['getChildByName']('container_righttop')['getChildByName']('btn_set')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            w['UI_Config'].Inst.show();
                        }, null, !1),
                    this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                    this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            w['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                        }, null, !1),
                    this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                    this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (w['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? w['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](b, function () {
                                        w['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : w['UI_Replay'].Inst && w['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                        }, null, !1),
                    this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                    this['btn_double_pass']['visible'] = !1;
                    var W = 0;
                    this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            if (view['DesktopMgr']['double_click_pass']) {
                                var j = Laya['timer']['currTimer'];
                                if (W + 300 > j) {
                                    if (w['UI_ChiPengHu'].Inst['enable'])
                                        w['UI_ChiPengHu'].Inst['onDoubleClick'](), b['recordDoubleClickTime'](j - W);
                                    else {
                                        var C = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                        w['UI_LiQiZiMo'].Inst['enable'] && (C = w['UI_LiQiZiMo'].Inst['onDoubleClick'](C)),
                                        C && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && b['recordDoubleClickTime'](j - W);
                                    }
                                    W = 0;
                                } else
                                    W = j;
                            }
                        }, null, !1),
                    this['_network_delay'] = new C(this.me['getChildByName']('img_signal')),
                    this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                    this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                    'en' == GameMgr['client_language'] && (V['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                },
                V['prototype']['recordDoubleClickTime'] = function (w) {
                    this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(w, this['min_double_time'])) : w,
                    this['max_double_time'] = this['max_double_time'] ? Math.max(w, this['max_double_time']) : w;
                },
                V['prototype']['onGameBroadcast'] = function (w) {
                    app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](w));
                    var j = view['DesktopMgr'].Inst['seat2LocalPosition'](w.seat),
                    C = JSON['parse'](w['content']);
                    null != C.emo && void 0 != C.emo && (this['onShowEmo'](j, C.emo), this['showAIEmo']());
                },
                V['prototype']['onPlayerConnectionState'] = function (w) {
                    app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](w));
                    var j = w.seat;
                    if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && j < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][j] = w['state']), this['enable']) {
                        var C = view['DesktopMgr'].Inst['seat2LocalPosition'](j);
                        this['_player_infos'][C]['disconnect']['visible'] = w['state'] != view['ELink_State']['READY'];
                    }
                },
                V['prototype']['_initFunc'] = function () {
                    var w = this;
                    this['_container_fun'] = this.me['getChildByName']('container_func'),
                    this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                    this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                    this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                    var j = this['_fun_out']['getChildByName']('btn_func'),
                    C = this['_fun_out']['getChildByName']('btn_func2'),
                    i = this['_fun_in_spr']['getChildByName']('btn_func');
                    j['clickHandler'] = C['clickHandler'] = new Laya['Handler'](this, function () {
                            var l = 0;
                            l = -270,
                            Laya['Tween'].to(w['_container_fun'], {
                                x: -624
                            }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](w, function () {
                                    w['_fun_in']['visible'] = !0,
                                    w['_fun_out']['visible'] = !1,
                                    Laya['Tween'].to(w['_container_fun'], {
                                        x: l
                                    }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](w, function () {
                                            j['disabled'] = !1,
                                            C['disabled'] = !1,
                                            i['disabled'] = !1,
                                            w['_fun_out']['visible'] = !1;
                                        }), 0, !0, !0);
                                })),
                            j['disabled'] = !0,
                            C['disabled'] = !0,
                            i['disabled'] = !0;
                        }, null, !1),
                    i['clickHandler'] = new Laya['Handler'](this, function () {
                            var l = -546;
                            Laya['Tween'].to(w['_container_fun'], {
                                x: -624
                            }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](w, function () {
                                    w['_fun_in']['visible'] = !1,
                                    w['_fun_out']['visible'] = !0,
                                    Laya['Tween'].to(w['_container_fun'], {
                                        x: l
                                    }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](w, function () {
                                            j['disabled'] = !1,
                                            C['disabled'] = !1,
                                            i['disabled'] = !1,
                                            w['_fun_out']['visible'] = !0;
                                        }), 0, !0, !0);
                                })),
                            j['disabled'] = !0,
                            C['disabled'] = !0,
                            i['disabled'] = !0;
                        });
                    var l = this['_fun_in']['getChildByName']('btn_autolipai'),
                    u = this['_fun_out']['getChildByName']('btn_autolipai2'),
                    b = this['_fun_out']['getChildByName']('autolipai'),
                    V = Laya['LocalStorage']['getItem']('autolipai'),
                    k = !0;
                    k = V && '' != V ? 'true' == V : !0,
                    this['refreshFuncBtnShow'](l, b, k),
                    l['clickHandler'] = u['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                            w['refreshFuncBtnShow'](l, b, view['DesktopMgr'].Inst['auto_liqi']),
                            Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                        }, null, !1);
                    var S = this['_fun_in']['getChildByName']('btn_autohu'),
                    H = this['_fun_out']['getChildByName']('btn_autohu2'),
                    N = this['_fun_out']['getChildByName']('autohu');
                    this['refreshFuncBtnShow'](S, N, !1),
                    S['clickHandler'] = H['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                            w['refreshFuncBtnShow'](S, N, view['DesktopMgr'].Inst['auto_hule']);
                        }, null, !1);
                    var W = this['_fun_in']['getChildByName']('btn_autonoming'),
                    e = this['_fun_out']['getChildByName']('btn_autonoming2'),
                    Y = this['_fun_out']['getChildByName']('autonoming');
                    this['refreshFuncBtnShow'](W, Y, !1),
                    W['clickHandler'] = e['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                            w['refreshFuncBtnShow'](W, Y, view['DesktopMgr'].Inst['auto_nofulu']);
                        }, null, !1);
                    var t = this['_fun_in']['getChildByName']('btn_automoqie'),
                    O = this['_fun_out']['getChildByName']('btn_automoqie2'),
                    L = this['_fun_out']['getChildByName']('automoqie');
                    this['refreshFuncBtnShow'](t, L, !1),
                    t['clickHandler'] = O['clickHandler'] = Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                            w['refreshFuncBtnShow'](t, L, view['DesktopMgr'].Inst['auto_moqie']);
                        }, null, !1),
                    'kr' == GameMgr['client_language'] && (b['scale'](0.9, 0.9), N['scale'](0.9, 0.9), Y['scale'](0.9, 0.9), L['scale'](0.9, 0.9)),
                    Laya['Browser'].onPC && !GameMgr['inConch'] ? (j['visible'] = !1, H['visible'] = !0, u['visible'] = !0, e['visible'] = !0, O['visible'] = !0) : (j['visible'] = !0, H['visible'] = !1, u['visible'] = !1, e['visible'] = !1, O['visible'] = !1);
                },
                V['prototype']['noAutoLipai'] = function () {
                    var w = this['_container_fun']['getChildByName']('btn_autolipai');
                    view['DesktopMgr'].Inst['auto_liqi'] = !0,
                    w['clickHandler'].run();
                },
                V['prototype']['resetFunc'] = function () {
                    var w = Laya['LocalStorage']['getItem']('autolipai'),
                    j = !0;
                    j = w && '' != w ? 'true' == w : !0;
                    var C = this['_fun_in']['getChildByName']('btn_autolipai'),
                    i = this['_fun_out']['getChildByName']('automoqie');
                    this['refreshFuncBtnShow'](C, i, j),
                    Laya['LocalStorage']['setItem']('autolipai', j ? 'true' : 'false'),
                    view['DesktopMgr'].Inst['setAutoLiPai'](j);
                    var l = this['_fun_in']['getChildByName']('btn_autohu'),
                    u = this['_fun_out']['getChildByName']('autohu');
                    this['refreshFuncBtnShow'](l, u, view['DesktopMgr'].Inst['auto_hule']);
                    var b = this['_fun_in']['getChildByName']('btn_autonoming'),
                    V = this['_fun_out']['getChildByName']('autonoming');
                    this['refreshFuncBtnShow'](b, V, view['DesktopMgr'].Inst['auto_nofulu']);
                    var k = this['_fun_in']['getChildByName']('btn_automoqie'),
                    S = this['_fun_out']['getChildByName']('automoqie');
                    this['refreshFuncBtnShow'](k, S, view['DesktopMgr'].Inst['auto_moqie']),
                    this['_container_fun'].x = -546,
                    this['_fun_in']['visible'] = !1,
                    this['_fun_out']['visible'] = !0; {
                        var H = this['_fun_out']['getChildByName']('btn_func');
                        this['_fun_out']['getChildByName']('btn_func2');
                    }
                    H['disabled'] = !1,
                    H['disabled'] = !1;
                },
                V['prototype']['setDora'] = function (w, j) {
                    if (0 > w || w >= this['doras']['length'])
                        return console['error']('setDora pos错误'), void 0;
                    var C = 'myres2/mjpm/' + (j['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjpm_view']) + /ui/;
                    this['doras'][w].skin = game['Tools']['localUISrc'](C + j['toString'](!1) + '.png'),
                    this['front_doras'][w]['visible'] = !j['touming'],
                    this['front_doras'][w].skin = game['Tools']['localUISrc']('myres2/mjp/' + GameMgr.Inst['mjp_view'] + '/hand/front.png');
                },
                V['prototype']['initRoom'] = function () {
                    var j = this;
                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                        for (var C = {}, i = 0; i < view['DesktopMgr'].Inst['player_datas']['length']; i++) {
                            for (var l = view['DesktopMgr'].Inst['player_datas'][i]['character'], u = l['charid'], b = cfg['item_definition']['character'].find(u).emo, V = 0; 9 > V; V++) {
                                var k = b + '/' + V['toString']() + '.png';
                                C[k] = 1;
                            }
                            if (l['extra_emoji'])
                                for (var V = 0; V < l['extra_emoji']['length']; V++) {
                                    var k = b + '/' + l['extra_emoji'][V]['toString']() + '.png';
                                    C[k] = 1;
                                }
                        }
                        var S = [];
                        for (var H in C)
                            S.push(H);
                        this['block_emo'].me.x = 1878,
                        this['block_emo']['reset'](),
                        game['LoadMgr']['loadResImage'](S, Laya['Handler']['create'](this, function () {
                                j['block_emo']['initRoom']();
                            })),
                        this['_btn_collect']['visible'] = !1;
                    } else {
                        for (var N = !1, i = 0; i < view['DesktopMgr'].Inst['player_datas']['length']; i++) {
                            var W = view['DesktopMgr'].Inst['player_datas'][i];
                            if (W && null != W['account_id'] && W['account_id'] == GameMgr.Inst['account_id']) {
                                N = !0;
                                break;
                            }
                        }
                        this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (w['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                        this['_btn_collect']['visible'] = N;
                    }
                    if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                        for (var e = 0, i = 0; i < view['DesktopMgr'].Inst['player_datas']['length']; i++) {
                            var W = view['DesktopMgr'].Inst['player_datas'][i];
                            W && null != W['account_id'] && 0 != W['account_id'] && e++;
                        }
                        1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                    }
                    for (var Y = 0, i = 0; i < view['DesktopMgr'].Inst['player_datas']['length']; i++) {
                        var W = view['DesktopMgr'].Inst['player_datas'][i];
                        W && null != W['account_id'] && 0 != W['account_id'] && Y++;
                    }
                    this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                    this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                    this['enable'] = !0,
                    this['setLiqibang'](0),
                    this['setBen'](0);
                    var t = this.me['getChildByName']('container_lefttop');
                    if (view['DesktopMgr'].Inst['is_chuanma_mode']())
                        t['getChildByName']('num_lizhi_0')['visible'] = !1, t['getChildByName']('num_lizhi_1')['visible'] = !1, t['getChildByName']('num_ben_0')['visible'] = !1, t['getChildByName']('num_ben_1')['visible'] = !1, t['getChildByName']('container_doras')['visible'] = !1, t['getChildByName']('gamemode')['visible'] = !1, t['getChildByName']('activitymode')['visible'] = !0, t['getChildByName']('MD5').y = 63, t['getChildByName']('MD5')['width'] = 239, t['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), t['getChildAt'](0)['width'] = 280, t['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (t['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, t['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (t['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), t['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), t['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, t['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                    else if (t['getChildByName']('num_lizhi_0')['visible'] = !0, t['getChildByName']('num_lizhi_1')['visible'] = !1, t['getChildByName']('num_ben_0')['visible'] = !0, t['getChildByName']('num_ben_1')['visible'] = !0, t['getChildByName']('container_doras')['visible'] = !0, t['getChildByName']('gamemode')['visible'] = !0, t['getChildByName']('activitymode')['visible'] = !1, t['getChildByName']('MD5').y = 51, t['getChildByName']('MD5')['width'] = 276, t['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), t['getChildAt'](0)['width'] = 313, t['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                        var O = view['DesktopMgr'].Inst['game_config'],
                        L = game['Tools']['get_room_desc'](O);
                        this['label_gamemode'].text = L.text,
                        this['container_gamemode']['visible'] = !0;
                    } else
                        this['container_gamemode']['visible'] = !1;
                    if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                        if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                            this['container_jjc']['visible'] = !0,
                            this['label_jjc_win'].text = w['UI_Activity_JJC']['win_count']['toString']();
                            for (var i = 0; 3 > i; i++)
                                this['container_jjc']['getChildByName'](i['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (w['UI_Activity_JJC']['lose_count'] > i ? 'd' : 'l') + '.png');
                        } else
                            this['container_jjc']['visible'] = !1;
                    else
                        this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                    w['UI_Replay'].Inst && (w['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                    var h = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                    v = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                    view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (w['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](h, !0), game['Tools']['setGrayDisable'](v, !0)) : (game['Tools']['setGrayDisable'](h, !1), game['Tools']['setGrayDisable'](v, !1), w['UI_Astrology'].Inst.hide());
                    for (var i = 0; 4 > i; i++)
                        this['_player_infos'][i]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][i]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png');
                },
                V['prototype']['onCloseRoom'] = function () {
                    this['_network_delay']['close_refresh']();
                },
                V['prototype']['refreshSeat'] = function (w) {
                    void 0 === w && (w = !1);
                    for (var j = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), C = 0; 4 > C; C++) {
                        var i = view['DesktopMgr'].Inst['localPosition2Seat'](C),
                        l = this['_player_infos'][C];
                        if (0 > i)
                            l['container']['visible'] = !1;
                        else {
                            l['container']['visible'] = !0;
                            var u = view['DesktopMgr'].Inst['getPlayerName'](i);
                            game['Tools']['SetNickname'](l.name, u),
                            l.head.id = j[i]['avatar_id'],
                            l.head['set_head_frame'](j[i]['account_id'], j[i]['avatar_frame']);
                            var b = (cfg['item_definition'].item.get(j[i]['avatar_frame']), cfg['item_definition'].view.get(j[i]['avatar_frame']));
                            if (l.head.me.y = b && b['sargs'][0] ? l['head_origin_y'] - Number(b['sargs'][0]) / 100 * this['head_offset_y'] : l['head_origin_y'], l['avatar'] = j[i]['avatar_id'], 0 != C) {
                                var V = j[i]['account_id'] && 0 != j[i]['account_id'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'],
                                k = j[i]['account_id'] && 0 != j[i]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                S = view['DesktopMgr'].Inst.mode != view['EMJMode'].play;
                                w ? l['headbtn']['onChangeSeat'](V, k, S) : l['headbtn']['reset'](V, k, S);
                            }
                            l['title'].id = j[i]['title'] ? game['Tools']['titleLocalization'](j[i]['account_id'], j[i]['title']) : 0;
                        }
                    }
                },
                V['prototype']['refreshNames'] = function () {
                    for (var w = 0; 4 > w; w++) {
                        var j = view['DesktopMgr'].Inst['localPosition2Seat'](w),
                        C = this['_player_infos'][w];
                        if (0 > j)
                            C['container']['visible'] = !1;
                        else {
                            C['container']['visible'] = !0;
                            var i = view['DesktopMgr'].Inst['getPlayerName'](j);
                            game['Tools']['SetNickname'](C.name, i);
                        }
                    }
                },
                V['prototype']['refreshLinks'] = function () {
                    for (var w = (view['DesktopMgr'].Inst.seat, 0); 4 > w; w++) {
                        var j = view['DesktopMgr'].Inst['localPosition2Seat'](w);
                        view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][w]['disconnect']['visible'] = -1 == j || 0 == w ? !1 : view['DesktopMgr']['player_link_state'][j] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][w]['disconnect']['visible'] = -1 == j || 0 == view['DesktopMgr'].Inst['player_datas'][j]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][j] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][w]['disconnect']['visible'] = !1);
                    }
                },
                V['prototype']['setBen'] = function (w) {
                    w > 99 && (w = 99);
                    var j = this.me['getChildByName']('container_lefttop'),
                    C = j['getChildByName']('num_ben_0'),
                    i = j['getChildByName']('num_ben_1');
                    w >= 10 ? (C.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](w / 10)['toString']() + '.png'), i.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (w % 10)['toString']() + '.png'), i['visible'] = !0) : (C.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (w % 10)['toString']() + '.png'), i['visible'] = !1);
                },
                V['prototype']['setLiqibang'] = function (w, j) {
                    void 0 === j && (j = !0),
                    w > 999 && (w = 999);
                    var C = this.me['getChildByName']('container_lefttop'),
                    i = C['getChildByName']('num_lizhi_0'),
                    l = C['getChildByName']('num_lizhi_1'),
                    u = C['getChildByName']('num_lizhi_2');
                    w >= 100 ? (u.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (w % 10)['toString']() + '.png'), l.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](w / 10) % 10)['toString']() + '.png'), i.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](w / 100)['toString']() + '.png'), l['visible'] = !0, u['visible'] = !0) : w >= 10 ? (l.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (w % 10)['toString']() + '.png'), i.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](w / 10)['toString']() + '.png'), l['visible'] = !0, u['visible'] = !1) : (i.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + w['toString']() + '.png'), l['visible'] = !1, u['visible'] = !1),
                    view['DesktopMgr'].Inst['setRevealScore'](w, j);
                },
                V['prototype']['reset_rounds'] = function () {
                    this['closeCountDown'](),
                    this['showscoredeltaing'] = !1,
                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                    for (var w = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /hand/, j = 0; j < this['doras']['length']; j++)
                        if (view['DesktopMgr'].Inst['is_jiuchao_mode']())
                            this['front_doras'][j]['visible'] = !1, this['doras'][j].skin = game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png');
                        else {
                            var C = 'myres2/mjpm/' + GameMgr.Inst['mjpm_view'] + /ui/;
                            this['front_doras'][j]['visible'] = !0,
                            this['doras'][j].skin = game['Tools']['localUISrc'](C + '5z.png'),
                            this['front_doras'][j].skin = game['Tools']['localUISrc'](w + 'back.png');
                        }
                    for (var j = 0; 4 > j; j++)
                        this['_player_infos'][j].emo['reset'](), this['_player_infos'][j].que['visible'] = !1;
                    this['_timecd']['reset'](),
                    Laya['timer']['clearAll'](this),
                    Laya['timer']['clearAll'](this['label_md5']),
                    view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                    this['label_md5']['visible'] = !1;
                },
                V['prototype']['showCountDown'] = function (w, j) {
                    this['_timecd']['showCD'](w, j);
                },
                V['prototype']['setZhenting'] = function (w) {
                    this['img_zhenting']['visible'] = w;
                },
                V['prototype']['shout'] = function (w, j, C, i) {
                    app.Log.log('shout:' + w + ' type:' + j);
                    try {
                        var l = this['_player_infos'][w],
                        u = l['container_shout'],
                        b = u['getChildByName']('img_content'),
                        V = u['getChildByName']('illust')['getChildByName']('illust'),
                        k = u['getChildByName']('img_score');
                        if (0 == i)
                            k['visible'] = !1;
                        else {
                            k['visible'] = !0;
                            var S = 0 > i ? 'm' + Math.abs(i) : i;
                            k.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + S + '.png');
                        }
                        '' == j ? b['visible'] = !1 : (b['visible'] = !0, b.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + j + '.png')),
                        view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (u['getChildByName']('illust')['visible'] = !1, u['getChildAt'](2)['visible'] = !0, u['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](u['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (u['getChildByName']('illust')['visible'] = !0, u['getChildAt'](2)['visible'] = !1, u['getChildAt'](0)['visible'] = !0, V['scaleX'] = 1, game['Tools']['charaPart'](C['avatar_id'], V, 'half', l['illustrect'], !0, !0));
                        var H = 0,
                        N = 0;
                        switch (w) {
                        case 0:
                            H = -105,
                            N = 0;
                            break;
                        case 1:
                            H = 500,
                            N = 0;
                            break;
                        case 2:
                            H = 0,
                            N = -300;
                            break;
                        default:
                            H = -500,
                            N = 0;
                        }
                        u['visible'] = !0,
                        u['alpha'] = 0,
                        u.x = l['shout_origin_x'] + H,
                        u.y = l['shout_origin_y'] + N,
                        Laya['Tween'].to(u, {
                            alpha: 1,
                            x: l['shout_origin_x'],
                            y: l['shout_origin_y']
                        }, 70),
                        Laya['Tween'].to(u, {
                            alpha: 0
                        }, 150, null, null, 600),
                        Laya['timer'].once(800, this, function () {
                            Laya['loader']['clearTextureRes'](V.skin),
                            u['visible'] = !1;
                        });
                    } catch (W) {
                        var e = {};
                        e['error'] = W['message'],
                        e['stack'] = W['stack'],
                        e['method'] = 'shout',
                        e['class'] = 'UI_DesktopInfos',
                        GameMgr.Inst['onFatalError'](e);
                    }
                },
                V['prototype']['closeCountDown'] = function () {
                    this['_timecd']['close']();
                },
                V['prototype']['refreshFuncBtnShow'] = function (w, j, C) {
                    var i = w['getChildByName']('img_choosed');
                    j['color'] = w['mouseEnabled'] ? C ? '#3bd647' : '#7992b3' : '#565656',
                    i['visible'] = C;
                },
                V['prototype']['onShowEmo'] = function (w, j) {
                    var C = this['_player_infos'][w];
                    0 != w && C['headbtn']['emj_banned'] || C.emo.show(w, j);
                },
                V['prototype']['changeHeadEmo'] = function (w) { {
                        var j = view['DesktopMgr'].Inst['seat2LocalPosition'](w);
                        this['_player_infos'][j];
                    }
                },
                V['prototype']['onBtnShowScoreDelta'] = function () {
                    var w = this;
                    this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                            w['showscoredeltaing'] = !1,
                            view['DesktopMgr'].Inst['setScoreDelta'](!1);
                        }));
                },
                V['prototype']['btn_seeinfo'] = function (j) {
                    if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst['gameing']) {
                        var C = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](j)]['account_id'];
                        if (C) {
                            var i = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                            l = 1,
                            u = view['DesktopMgr'].Inst['game_config'].meta;
                            u && u['mode_id'] == game['EMatchMode']['shilian'] && (l = 4),
                            w['UI_OtherPlayerInfo'].Inst.show(C, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, i ? 1 : 2, l);
                        }
                    }
                },
                V['prototype']['openDora3BeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openPeipaiOpenBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openDora3BeginShine'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](244),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openMuyuOpenBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openShilianOpenBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openXiuluoOpenBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openChuanmaBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openJiuChaoBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openAnPaiBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openTopMatchOpenBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openZhanxingBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['openTianmingBeginEffect'] = function () {
                    var w = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                    view['AudioMgr']['PlayAudio'](243),
                    Laya['timer'].once(5000, w, function () {
                        w['destory']();
                    });
                },
                V['prototype']['logUpEmoInfo'] = function () {
                    this['block_emo']['sendEmoLogUp'](),
                    this['min_double_time'] = 0,
                    this['max_double_time'] = 0;
                },
                V['prototype']['onCollectChange'] = function () {
                    this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (w['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                },
                V['prototype']['showAIEmo'] = function () {
                    for (var w = this, j = function (j) {
                        var i = view['DesktopMgr'].Inst['player_datas'][j];
                        i['account_id'] && 0 != i['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), C, function () {
                            w['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](j), Math['floor'](9 * Math['random']()));
                        });
                    }, C = this, i = 0; i < view['DesktopMgr'].Inst['player_datas']['length']; i++)
                        j(i);
                },
                V['prototype']['setGapType'] = function (w, j) {
                    void 0 === j && (j = !1);
                    for (var C = 0; C < w['length']; C++) {
                        var i = view['DesktopMgr'].Inst['seat2LocalPosition'](C);
                        this['_player_infos'][i].que['visible'] = !0,
                        j && (0 == C ? (this['_player_infos'][i].que.pos(this['gapStartPosLst'][C].x + this['selfGapOffsetX'][w[C]], this['gapStartPosLst'][C].y), this['_player_infos'][i].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][i].que, {
                                    scaleX: 0.35,
                                    scaleY: 0.35,
                                    x: this['_player_infos'][i]['que_target_pos'].x,
                                    y: this['_player_infos'][i]['que_target_pos'].y
                                }, 200)) : (this['_player_infos'][i].que.pos(this['gapStartPosLst'][C].x, this['gapStartPosLst'][C].y), this['_player_infos'][i].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][i].que, {
                                    scaleX: 0.35,
                                    scaleY: 0.35,
                                    x: this['_player_infos'][i]['que_target_pos'].x,
                                    y: this['_player_infos'][i]['que_target_pos'].y
                                }, 200))),
                        this['_player_infos'][i].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + w[C] + '.png');
                    }
                },
                V['prototype']['OnNewCard'] = function (w, j) {
                    if (j) {
                        var C = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                        view['AudioMgr']['PlayAudio'](243),
                        Laya['timer'].once(5000, C, function () {
                            C['destory']();
                        }),
                        Laya['timer'].once(1300, this, function () {
                            this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                        });
                    } else
                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                },
                V['prototype']['ShowSpellCard'] = function (j, C) {
                    void 0 === C && (C = !1),
                    w['UI_FieldSpell'].Inst && !w['UI_FieldSpell'].Inst['enable'] && w['UI_FieldSpell'].Inst.show(j, C);
                },
                V['prototype']['HideSpellCard'] = function () {
                    w['UI_FieldSpell'].Inst && w['UI_FieldSpell'].Inst['close']();
                },
                V['prototype']['SetTianMingRate'] = function (w, j, C) {
                    void 0 === C && (C = !1);
                    var i = view['DesktopMgr'].Inst['seat2LocalPosition'](w),
                    l = this['_player_infos'][i]['tianming'];
                    C && 5 != j && l.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + j + '.png') && Laya['Tween'].to(l, {
                        scaleX: 1.1,
                        scaleY: 1.1
                    }, 200, null, Laya['Handler']['create'](this, function () {
                            Laya['Tween'].to(l, {
                                scaleX: 1,
                                scaleY: 1
                            }, 200);
                        })),
                    l.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + j + '.png');
                },
                V.Inst = null,
                V;
            }
            (w['UIBase']);
            w['UI_DesktopInfo'] = b;
        }
        (uiscript || (uiscript = {}));
        





        uiscript.UI_Info.Init  = function () {
            // 设置名称
             if (MMP.settings.nickname != '') {
                            GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
                        }
                        // END
                        var j = this;
                        this['read_list'] = [],
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                            lang: GameMgr['client_language'],
                            platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                        }, function (C, i) {
                            C || i['error'] ? w['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', C, i) : j['_refreshAnnouncements'](i);
                            // START
                                if ((C || i['error']) === null) {
                                    if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                                        uiscript.UI_Info.Inst.show();
                                        MMP.settings.isReadme = true;
                                        MMP.settings.version = GM_info['script']['version'];
                                        MMP.saveSettings();
                                    }
                                }
                                // END
                        }),
                        app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function (w) {
                                for (var C = GameMgr['inDmm'] ? 'web_dmm' : 'web', i = 0, l = w['update_list']; i < l['length']; i++) {
                                    var u = l[i];
                                    if (u.lang == GameMgr['client_language'] && u['platform'] == C) {
                                        j['have_new_notice'] = !0;
                                        break;
                                    }
                                }
                            }, null, !1));
                    }
            


                    uiscript.UI_Info._refreshAnnouncements = function (w) {
                        // START
                        w.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
                        // END
                        if (w['announcements'] && (this['announcements'] = w['announcements']), w.sort && (this['announcement_sort'] = w.sort), w['read_list']) {
                            this['read_list'] = [];
                            for (var j = 0; j < w['read_list']['length']; j++)
                                this['read_list'].push(w['read_list'][j]);
                            this.read_list.splice(0, 0, 666666, 777777);
                        }
                    }
            




        // 加载CG 
        !function (w) {
            var j = function () {
                function j(j, C) {
                    var i = this;
                    this['cg_id'] = 0,
                    this.me = j,
                    this['father'] = C;
                    var l = this.me['getChildByName']('btn_detail');
                    l['clickHandler'] = new Laya['Handler'](this, function () {
                            w['UI_Bag'].Inst['locking'] || i['father']['changeLoadingCG'](i['cg_id']);
                        }),
                    game['Tools']['setButtonLongPressHandler'](l, new Laya['Handler'](this, function (j) {
                            if (!w['UI_Bag'].Inst['locking']) {
                                'down' == j ? Laya['timer'].once(800, i, function () {
                                    w['UI_CG_Yulan'].Inst.show(i['cg_id']);
                                }) : ('over' == j || 'up' == j) && Laya['timer']['clearAll'](i);
                            }
                        })),
                    this['using'] = l['getChildByName']('using'),
                    this.icon = l['getChildByName']('icon'),
                    this.name = l['getChildByName']('name'),
                    this.info = l['getChildByName']('info'),
                    this['label_time'] = this.info['getChildByName']('info'),
                    this['sprite_new'] = l['getChildByName']('new');
                }
                return j['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var j = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != w['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                    game['LoadMgr']['setImgSkin'](this.icon, j['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var C = !this['father']['last_seen_cg_map'][this['cg_id']], i = 0, l = j['unlock_items']; i < l['length']; i++) {
                        var u = l[i];
                        if (u && w['UI_Bag']['get_item_count'](u) > 0) {
                            var b = cfg['item_definition'].item.get(u);
                            if (this.name.text = b['name_' + GameMgr['client_language']], !b['item_expire']) {
                                this.info['visible'] = !1,
                                C = -1 != this['father']['new_cg_ids']['indexOf'](u);
                                break;
                            }
                            this.info['visible'] = !0,
                            this['label_time'].text = game['Tools']['strOfLocalization'](3119) + b['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = C;
                },
                j['prototype']['reset'] = function () {
                    game['LoadMgr']['clearImgSkin'](this.icon),
                    Laya['Loader']['clearTextureRes'](this.icon.skin);
                },
                j;
            }
            (),
            C = function () {
                function C(w) {
                    this['seen_cg_map'] = null,
                    this['last_seen_cg_map'] = null,
                    this['new_cg_ids'] = [],
                    this.me = w,
                    this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                    this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                    this['no_info'] = this.me['getChildByName']('no_info'),
                    this.head = this.me['getChildByName']('head');
                }
                return C['prototype']['have_redpoint'] = function () {
                                // START
                    //if (w['UI_Bag']['new_cg_ids']['length'] > 0)
                        return !0;
                                // END
                    var j = [];
                    if (!this['seen_cg_map']) {
                        var C = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                        if (this['seen_cg_map'] = {}, C) {
                            C = game['Tools']['dddsss'](C);
                            for (var i = C['split'](','), l = 0; l < i['length']; l++)
                                this['seen_cg_map'][Number(i[l])] = 1;
                        }
                    }
                    cfg['item_definition']['loading_image']['forEach'](function (C) {
                        C['unlock_items'][1] && 0 == w['UI_Bag']['get_item_count'](C['unlock_items'][0]) && w['UI_Bag']['get_item_count'](C['unlock_items'][1]) > 0 && j.push(C.id);
                    });
                    for (var u = 0, b = j; u < b['length']; u++) {
                        var V = b[u];
                        if (!this['seen_cg_map'][V])
                            return !0;
                    }
                    return !1;
                },
                C['prototype'].show = function () {
                    var j = this;
                    if (this['new_cg_ids'] = w['UI_Bag']['new_cg_ids'], w['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                        var C = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                        if (this['seen_cg_map'] = {}, C) {
                            C = game['Tools']['dddsss'](C);
                            for (var i = C['split'](','), l = 0; l < i['length']; l++)
                                this['seen_cg_map'][Number(i[l])] = 1;
                        }
                    }
                    this['last_seen_cg_map'] = this['seen_cg_map'];
                    var u = '';
                    cfg['item_definition']['loading_image']['forEach'](function (C) {
                        for (var i = 0, l = C['unlock_items']; i < l['length']; i++) {
                            var b = l[i];
                            if (b && w['UI_Bag']['get_item_count'](b) > 0)
                                return j['items'].push(C), j['seen_cg_map'][C.id] = 1, '' != u && (u += ','), u += C.id, void 0;
                        }
                    }),
                    this['items'].sort(function (w, j) {
                        return j.sort - w.sort;
                    }),
                    Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](u)),
                    w['UI_Bag'].Inst['refreshRedpoint'](),
                    this.me['visible'] = !0,
                    this['scrollview']['addItem'](this['items']['length']),
                    game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !0),
                    this['no_info']['visible'] = 0 == this['items']['length'],
                    this.head['visible'] = 0 != this['items']['length'],
                    this['_changed'] = !1;
                },
                C['prototype']['close'] = function () {
                    this.me['visible'] = !1,
                    this['items'] = [],
                    this['scrollview']['reset'](),
                    game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !1),
                    this['_changed'] && w['UI_Loading']['loadNextCG']();
                },
                C['prototype']['render_item'] = function (w) {
                    var C = w['index'],
                    i = w['container'],
                    l = w['cache_data'];
                    if (this['items'][C]) {
                        l.item || (l.item = new j(i, this));
                        var u = l.item;
                        u['cg_id'] = this['items'][C].id,
                        u.show();
                    }
                },
                C['prototype']['changeLoadingCG'] = function (j) {
                    this['_changed'] = !0;
                    for (var C = 0, i = 0, l = 0, u = this['items']; l < u['length']; l++) {
                        var b = u[l];
                        if (b.id == j) {
                            C = i;
                            break;
                        }
                        i++;
                    }
                    var V = w['UI_Loading']['Loading_Images']['indexOf'](j);
                    -1 == V ? w['UI_Loading']['Loading_Images'].push(j) : w['UI_Loading']['Loading_Images']['splice'](V, 1),
                    this['scrollview']['wantToRefreshItem'](C),
                    this['locking'] = !0,
                                        // START
                                        MMP.settings.loadingCG = w['UI_Loading']['Loading_Images'];
                                    MMP.saveSettings();
                    //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                    //    images: w['UI_Loading']['Loading_Images']
                    //}, function (j, C) {
                    //    (j || C['error']) && w['UIMgr'].Inst['showNetReqError']('setLoadingImage', j, C);
                    //});
                                    // END
                },
                C['prototype']['when_update_data'] = function () {
                    this['scrollview']['wantToRefreshAll']();
                },
                C;
            }
            ();
            w['UI_Bag_PageCG'] = C;
        }
        (uiscript || (uiscript = {}));
        


        uiscript.UI_Entrance.prototype._onLoginSuccess= function (j, C, i) {
            var w = uiscript;
    var l = this;
    if (void 0 === i && (i = !1), app.Log.log('登陆：' + JSON['stringify'](C)), GameMgr.Inst['account_id'] = C['account_id'], GameMgr.Inst['account_data'] = C['account'], w['UI_ShiMingRenZheng']['renzhenged'] = C['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, C['account']['platform_diamond'])
        for (var u = C['account']['platform_diamond'], b = 0; b < u['length']; b++)
            GameMgr.Inst['account_numerical_resource'][u[b].id] = u[b]['count'];
    if (C['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = C['account']['skin_ticket']), C['account']['platform_skin_ticket'])
        for (var V = C['account']['platform_skin_ticket'], b = 0; b < V['length']; b++)
            GameMgr.Inst['account_numerical_resource'][V[b].id] = V[b]['count'];
    GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
    C['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = C['game_info']['location'], GameMgr.Inst['mj_game_token'] = C['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = C['game_info']['game_uuid']),
    C['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : j['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', C['access_token']), GameMgr.Inst['sociotype'] = j, GameMgr.Inst['access_token'] = C['access_token']);
    var k = this,
    S = function () {
        GameMgr.Inst['onLoadStart']('login'),
        Laya['LocalStorage']['removeItem']('__ad_s'),
        w['UI_Loading'].Inst.show('load_lobby'),
        k['enable'] = !1,
        k['scene']['close'](),
        w['UI_Entrance_Mail_Regist'].Inst['close'](),
        k['login_loading']['close'](),
        w['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](k, function () {
                GameMgr.Inst['afterLogin'](),
                k['route_info']['onClose'](),
                GameMgr.Inst['account_data']['anti_addiction'] && w['UIMgr'].Inst['ShowPreventAddiction'](),
                k['destroy'](),
                k['disposeRes'](),
                w['UI_Add2Desktop'].Inst && (w['UI_Add2Desktop'].Inst['destroy'](), w['UI_Add2Desktop'].Inst = null);
            }), Laya['Handler']['create'](k, function (j) {
                return w['UI_Loading'].Inst['setProgressVal'](0.2 * j);
            }, null, !1));
    },
    H = Laya['Handler']['create'](this, function () {
            0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (j, C) {
                j ? (app.Log.log('fetchRefundOrder err:' + j), l['showError'](game['Tools']['strOfLocalization'](2061), j), l['showContainerLogin']()) : (w['UI_Refund']['orders'] = C['orders'], w['UI_Refund']['clear_deadline'] = C['clear_deadline'], w['UI_Refund']['message'] = C['message'], S());
            }) : S();
        });
            // START
    //if (w['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
    //    for (var N = 0, W = GameMgr.Inst['account_data']['loading_image']; N < W['length']; N++) {
    //        var e = W[N];
    //        cfg['item_definition']['loading_image'].get(e) && w['UI_Loading']['Loading_Images'].push(e);
    //    }
            uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
            // END
    w['UI_Loading']['loadNextCG'](),
    'chs' != GameMgr['client_type'] || C['account']['phone_verify'] ? H.run() : (w['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, w['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (j, C) {
                    j || C['error'] ? l['showError'](j, C['error']) : 0 == C['phone_login'] ? w['UI_Create_Phone_Account'].Inst.show(H) : w['UI_Canot_Create_Phone_Account'].Inst.show(H);
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
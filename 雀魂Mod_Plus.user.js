// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      0.11.5.1
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
        !function (f) {
            var H;
            !function (f) {
                f[f.none = 0] = 'none',
                    f[f['daoju'] = 1] = 'daoju',
                    f[f.gift = 2] = 'gift',
                    f[f['fudai'] = 3] = 'fudai',
                    f[f.view = 5] = 'view';
            }
                (H = f['EItemCategory'] || (f['EItemCategory'] = {}));
            var N = function (N) {
                function Q() {
                    var f = N.call(this, new ui['lobby']['bagUI']()) || this;
                    return f['container_top'] = null,
                        f['container_content'] = null,
                        f['locking'] = !1,
                        f.tabs = [],
                        f['page_item'] = null,
                        f['page_gift'] = null,
                        f['page_skin'] = null,
                        f['page_cg'] = null,
                        f['select_index'] = 0,
                        Q.Inst = f,
                        f;
                }
                return __extends(Q, N),
                    Q.init = function () {
                        var f = this;
                        app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (H) {
                            var N = H['update'];
                            N && N.bag && (f['update_data'](N.bag['update_items']), f['update_daily_gain_data'](N.bag));
                        }, null, !1)),
                            //GameMgr.Inst['use_fetch_info'] || 
                            this['fetch']();
                    },
                    Q['fetch'] = function () {
                        var H = this;
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {},
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchBagInfo', {}, function (N, Q) {
                                if (N || Q['error'])
                                    f['UIMgr'].Inst['showNetReqError']('fetchBagInfo', N, Q);
                                else {
                                    app.Log.log('背包信息：' + JSON['stringify'](Q));
                                    var D = Q.bag;
                                    if (D) {
                                        if (MMP.settings.setItems.setAllItems) {
                                            //设置全部道具
                                            var items = cfg.item_definition.item.map_;
                                            for (var id in items) {
                                                if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                                    for (let item of D["items"]) {
                                                        if (item.item_id == id) {
                                                            cfg.item_definition.item.get(item.item_id);
                                                            H._item_map[item.item_id] = {
                                                                item_id: item.item_id,
                                                                count: item.stack,
                                                                category: items[item.item_id].category
                                                            };
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    cfg.item_definition.item.get(id);
                                                    H._item_map[id] = {
                                                        item_id: id,
                                                        count: 1,
                                                        category: items[id].category
                                                    }; //获取物品列表并添加
                                                }
                                            }
                                        } else {
                                            if (D['items'])
                                                for (var K = 0; K < D['items']['length']; K++) {
                                                    var b = D['items'][K]['item_id'],
                                                        I = D['items'][K]['stack'],
                                                        q = cfg['item_definition'].item.get(b);
                                                    q && (H['_item_map'][b] = {
                                                        item_id: b,
                                                        count: I,
                                                        category: q['category']
                                                    }, 1 == q['category'] && 3 == q.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                        item_id: b
                                                    }, function () { }));
                                                }
                                            if (D['daily_gain_record'])
                                                for (var a = D['daily_gain_record'], K = 0; K < a['length']; K++) {
                                                    var J = a[K]['limit_source_id'];
                                                    H['_daily_gain_record'][J] = {};
                                                    var k = a[K]['record_time'];
                                                    H['_daily_gain_record'][J]['record_time'] = k;
                                                    var r = a[K]['records'];
                                                    if (r)
                                                        for (var d = 0; d < r['length']; d++)
                                                            H['_daily_gain_record'][J][r[d]['item_id']] = r[d]['count'];
                                                }
                                        }
                                    }
                                }
                            });
                    },
                    Q['onFetchSuccess'] = function (f) {
                        this['_item_map'] = {},
                            this['_daily_gain_record'] = {};
                        var H = f['bag_info'];
                        if (H) {
                            var N = H.bag;
                            if (N) {
                                if (MMP.settings.setItems.setAllItems) {
                                    //设置全部道具
                                    var items = cfg.item_definition.item.map_;
                                    for (var id in items) {
                                        if (MMP.settings.setItems.ignoreItems.includes(Number(id)) || (MMP.settings.setItems.ignoreEvent ? (id.slice(0, 3) == '309' ? true : false) : false)) {
                                            for (let item of N["items"]) {
                                                if (item.item_id == id) {
                                                    cfg.item_definition.item.get(item.item_id);
                                                    this._item_map[item.item_id] = {
                                                        item_id: item.item_id,
                                                        count: item.stack,
                                                        category: items[item.item_id].category
                                                    };
                                                    break;
                                                }
                                            }
                                        } else {
                                            cfg.item_definition.item.get(id);
                                            this._item_map[id] = {
                                                item_id: id,
                                                count: 1,
                                                category: items[id].category
                                            }; //获取物品列表并添加
                                        }
                                    }
                                } else {
                                    if (N['items'])
                                        for (var Q = 0; Q < N['items']['length']; Q++) {
                                            var D = N['items'][Q]['item_id'],
                                                K = N['items'][Q]['stack'],
                                                b = cfg['item_definition'].item.get(D);
                                            b && (this['_item_map'][D] = {
                                                item_id: D,
                                                count: K,
                                                category: b['category']
                                            }, 1 == b['category'] && 3 == b.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                                item_id: D
                                            }, function () { }));
                                        }
                                    if (N['daily_gain_record'])
                                        for (var I = N['daily_gain_record'], Q = 0; Q < I['length']; Q++) {
                                            var q = I[Q]['limit_source_id'];
                                            this['_daily_gain_record'][q] = {};
                                            var a = I[Q]['record_time'];
                                            this['_daily_gain_record'][q]['record_time'] = a;
                                            var J = I[Q]['records'];
                                            if (J)
                                                for (var k = 0; k < J['length']; k++)
                                                    this['_daily_gain_record'][q][J[k]['item_id']] = J[k]['count'];
                                        }
                                }
                            }
                        }
                    },
                    Q['find_item'] = function (f) {
                        var H = this['_item_map'][f];
                        return H ? {
                            item_id: H['item_id'],
                            category: H['category'],
                            count: H['count']
                        }
                            : null;
                    },
                    Q['get_item_count'] = function (f) {
                        var H = this['find_item'](f);
                        if (H)
                            return H['count'];
                        if ('100001' == f) {
                            for (var N = 0, Q = 0, D = GameMgr.Inst['free_diamonds']; Q < D['length']; Q++) {
                                var K = D[Q];
                                GameMgr.Inst['account_numerical_resource'][K] && (N += GameMgr.Inst['account_numerical_resource'][K]);
                            }
                            for (var b = 0, I = GameMgr.Inst['paid_diamonds']; b < I['length']; b++) {
                                var K = I[b];
                                GameMgr.Inst['account_numerical_resource'][K] && (N += GameMgr.Inst['account_numerical_resource'][K]);
                            }
                            return N;
                        }
                        if ('100004' == f) {
                            for (var q = 0, a = 0, J = GameMgr.Inst['free_pifuquans']; a < J['length']; a++) {
                                var K = J[a];
                                GameMgr.Inst['account_numerical_resource'][K] && (q += GameMgr.Inst['account_numerical_resource'][K]);
                            }
                            for (var k = 0, r = GameMgr.Inst['paid_pifuquans']; k < r['length']; k++) {
                                var K = r[k];
                                GameMgr.Inst['account_numerical_resource'][K] && (q += GameMgr.Inst['account_numerical_resource'][K]);
                            }
                            return q;
                        }
                        return '100002' == f ? GameMgr.Inst['account_data'].gold : 0;
                    },
                    Q['find_items_by_category'] = function (f, H) {
                        var N = [];
                        for (var Q in this['_item_map'])
                            this['_item_map'][Q]['category'] == f && this['_item_map'][Q]['count'] && N.push({
                                item_id: this['_item_map'][Q]['item_id'],
                                category: this['_item_map'][Q]['category'],
                                count: this['_item_map'][Q]['count']
                            });
                        return H && N.sort(function (f, N) {
                            return cfg['item_definition'].item.get(f['item_id'])[H] - cfg['item_definition'].item.get(N['item_id'])[H];
                        }),
                            N;
                    },
                    Q['update_data'] = function (H) {
                        for (var N = 0; N < H['length']; N++) {
                            var Q = H[N]['item_id'],
                                D = H[N]['stack'];
                            if (D > 0) {
                                this['_item_map']['hasOwnProperty'](Q['toString']()) ? this['_item_map'][Q]['count'] = D : this['_item_map'][Q] = {
                                    item_id: Q,
                                    count: D,
                                    category: cfg['item_definition'].item.get(Q)['category']
                                };
                                var K = cfg['item_definition'].item.get(Q);
                                1 == K['category'] && 3 == K.type && app['NetAgent']['sendReq2Lobby']('Lobby', 'openAllRewardItem', {
                                    item_id: Q
                                }, function () { }),
                                    5 == K['category'] && (this['new_bag_item_ids'].push(Q), this['new_zhuangban_item_ids'][Q] = 1),
                                    8 != K['category'] || K['item_expire'] || this['new_cg_ids'].push(Q);
                            } else if (this['_item_map']['hasOwnProperty'](Q['toString']())) {
                                var b = cfg['item_definition'].item.get(Q);
                                b && 5 == b['category'] && f['UI_Sushe']['on_view_remove'](Q),
                                    this['_item_map'][Q] = 0,
                                    delete this['_item_map'][Q];
                            }
                        }
                        this.Inst && this.Inst['when_data_change']();
                        for (var N = 0; N < H['length']; N++) {
                            var Q = H[N]['item_id'];
                            if (this['_item_listener']['hasOwnProperty'](Q['toString']()))
                                for (var I = this['_item_listener'][Q], q = 0; q < I['length']; q++)
                                    I[q].run();
                        }
                        for (var N = 0; N < this['_all_item_listener']['length']; N++)
                            this['_all_item_listener'][N].run();
                    },
                    Q['update_daily_gain_data'] = function (f) {
                        var H = f['update_daily_gain_record'];
                        if (H)
                            for (var N = 0; N < H['length']; N++) {
                                var Q = H[N]['limit_source_id'];
                                this['_daily_gain_record'][Q] || (this['_daily_gain_record'][Q] = {});
                                var D = H[N]['record_time'];
                                this['_daily_gain_record'][Q]['record_time'] = D;
                                var K = H[N]['records'];
                                if (K)
                                    for (var b = 0; b < K['length']; b++)
                                        this['_daily_gain_record'][Q][K[b]['item_id']] = K[b]['count'];
                            }
                    },
                    Q['get_item_daily_record'] = function (f, H) {
                        return this['_daily_gain_record'][f] ? this['_daily_gain_record'][f]['record_time'] ? game['Tools']['isPassedRefreshTimeServer'](this['_daily_gain_record'][f]['record_time']) ? this['_daily_gain_record'][f][H] ? this['_daily_gain_record'][f][H] : 0 : 0 : 0 : 0;
                    },
                    Q['add_item_listener'] = function (f, H) {
                        this['_item_listener']['hasOwnProperty'](f['toString']()) || (this['_item_listener'][f] = []),
                            this['_item_listener'][f].push(H);
                    },
                    Q['remove_item_listener'] = function (f, H) {
                        var N = this['_item_listener'][f];
                        if (N)
                            for (var Q = 0; Q < N['length']; Q++)
                                if (N[Q] === H) {
                                    N[Q] = N[N['length'] - 1],
                                        N.pop();
                                    break;
                                }
                    },
                    Q['add_all_item_listener'] = function (f) {
                        this['_all_item_listener'].push(f);
                    },
                    Q['remove_all_item_listener'] = function (f) {
                        for (var H = this['_all_item_listener'], N = 0; N < H['length']; N++)
                            if (H[N] === f) {
                                H[N] = H[H['length'] - 1],
                                    H.pop();
                                break;
                            }
                    },
                    Q['removeAllBagNew'] = function () {
                        this['new_bag_item_ids'] = [];
                    },
                    Q['removeAllCGNew'] = function () {
                        this['new_cg_ids'] = [];
                    },
                    Q['removeZhuangBanNew'] = function (f) {
                        for (var H = 0, N = f; H < N['length']; H++) {
                            var Q = N[H];
                            delete this['new_zhuangban_item_ids'][Q];
                        }
                    },
                    Q['prototype']['have_red_point'] = function () {
                        return this['page_cg']['have_redpoint']();
                    },
                    Q['prototype']['onCreate'] = function () {
                        var H = this;
                        this['container_top'] = this.me['getChildByName']('top'),
                            this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                H['locking'] || H.hide(Laya['Handler']['create'](H, function () {
                                    return H['closeHandler'] ? (H['closeHandler'].run(), H['closeHandler'] = null, void 0) : (f['UI_Lobby'].Inst['enable'] = !0, void 0);
                                }));
                            }, null, !1),
                            this['container_content'] = this.me['getChildByName']('content');
                        for (var N = function (f) {
                            Q.tabs.push(Q['container_content']['getChildByName']('tabs')['getChildByName']('btn' + f)),
                                Q.tabs[f]['clickHandler'] = Laya['Handler']['create'](Q, function () {
                                    H['select_index'] != f && H['on_change_tab'](f);
                                }, null, !1);
                        }, Q = this, D = 0; 5 > D; D++)
                            N(D);
                        this['page_item'] = new f['UI_Bag_PageItem'](this['container_content']['getChildByName']('page_items')),
                            this['page_gift'] = new f['UI_Bag_PageGift'](this['container_content']['getChildByName']('page_gift')),
                            this['page_skin'] = new f['UI_Bag_PageSkin'](this['container_content']['getChildByName']('page_skin')),
                            this['page_cg'] = new f['UI_Bag_PageCG'](this['container_content']['getChildByName']('page_cg'));
                    },
                    Q['prototype'].show = function (H, N) {
                        var Q = this;
                        void 0 === H && (H = 0),
                            void 0 === N && (N = null),
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this['closeHandler'] = N,
                            f['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            f['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                Q['locking'] = !1;
                            }),
                            this['on_change_tab'](H),
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    Q['prototype']['onSkinYuLanBack'] = function () {
                        var H = this;
                        this['enable'] = !0,
                            this['locking'] = !0,
                            f['UIBase']['anim_alpha_in'](this['container_top'], {
                                y: -30
                            }, 200),
                            f['UIBase']['anim_alpha_in'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                H['locking'] = !1;
                            }),
                            this['page_skin'].me['visible'] = !0,
                            this['refreshRedpoint'](),
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1);
                    },
                    Q['prototype'].hide = function (H) {
                        var N = this;
                        this['locking'] = !0,
                            f['UIBase']['anim_alpha_out'](this['container_top'], {
                                y: -30
                            }, 200),
                            f['UIBase']['anim_alpha_out'](this['container_content'], {
                                y: 30
                            }, 200),
                            Laya['timer'].once(300, this, function () {
                                N['locking'] = !1,
                                    N['enable'] = !1,
                                    H && H.run();
                            });
                    },
                    Q['prototype']['onDisable'] = function () {
                        this['page_skin']['close'](),
                            this['page_item']['close'](),
                            this['page_gift']['close'](),
                            this['page_cg']['close']();
                    },
                    Q['prototype']['on_change_tab'] = function (f) {
                        this['select_index'] = f;
                        for (var N = 0; N < this.tabs['length']; N++)
                            this.tabs[N].skin = game['Tools']['localUISrc'](f == N ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'), this.tabs[N]['getChildAt'](0)['color'] = f == N ? '#d9b263' : '#8cb65f';
                        switch (this['page_item']['close'](), this['page_gift']['close'](), this['page_skin'].me['visible'] = !1, this['page_cg']['close'](), f) {
                            case 0:
                                this['page_item'].show(H['daoju']);
                                break;
                            case 1:
                                this['page_gift'].show();
                                break;
                            case 2:
                                this['page_item'].show(H.view);
                                break;
                            case 3:
                                this['page_skin'].show();
                                break;
                            case 4:
                                this['page_cg'].show();
                        }
                    },
                    Q['prototype']['when_data_change'] = function () {
                        this['page_item'].me['visible'] && this['page_item']['when_update_data'](),
                            this['page_gift'].me['visible'] && this['page_gift']['when_update_data']();
                    },
                    Q['prototype']['on_cg_change'] = function () {
                        this['page_cg']['when_update_data']();
                    },
                    Q['prototype']['refreshRedpoint'] = function () {
                        this.tabs[4]['getChildByName']('redpoint')['visible'] = this['page_cg']['have_redpoint']();
                    },
                    Q['_item_map'] = {},
                    Q['_item_listener'] = {},
                    Q['_all_item_listener'] = [],
                    Q['_daily_gain_record'] = {},
                    Q['new_bag_item_ids'] = [],
                    Q['new_zhuangban_item_ids'] = {},
                    Q['new_cg_ids'] = [],
                    Q.Inst = null,
                    Q;
            }
                (f['UIBase']);
            f['UI_Bag'] = N;
        }
            (uiscript || (uiscript = {}));













        // 修改牌桌上角色
        !function (f) {
            var H = function () {
                function H() {
                    var H = this;
                    this.urls = [],
                        this['link_index'] = -1,
                        this['connect_state'] = f['EConnectState'].none,
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
                        app['NetAgent']['AddListener2MJ']('NotifyPlayerLoadGameReady', Laya['Handler']['create'](this, function (f) {
                            app.Log.log('NotifyPlayerLoadGameReady: ' + JSON['stringify'](f)),
                                H['loaded_player_count'] = f['ready_id_list']['length'],
                                H['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](H['loaded_player_count'], H['real_player_count']);
                        }));
                }
                return Object['defineProperty'](H, 'Inst', {
                    get: function () {
                        return null == this['_Inst'] ? this['_Inst'] = new H() : this['_Inst'];
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    H['prototype']['OpenConnect'] = function (H, N, Q, D) {
                        var K = this;
                        uiscript['UI_Loading'].Inst.show('enter_mj'),
                            f['Scene_Lobby'].Inst && f['Scene_Lobby'].Inst['active'] && (f['Scene_Lobby'].Inst['active'] = !1),
                            f['Scene_Huiye'].Inst && f['Scene_Huiye'].Inst['active'] && (f['Scene_Huiye'].Inst['active'] = !1),
                            this['Close'](),
                            view['BgmListMgr']['stopBgm'](),
                            this['is_ob'] = !1,
                            Laya['timer'].once(500, this, function () {
                                K.url = '',
                                    K['token'] = H,
                                    K['game_uuid'] = N,
                                    K['server_location'] = Q,
                                    GameMgr.Inst['ingame'] = !0,
                                    GameMgr.Inst['mj_server_location'] = Q,
                                    GameMgr.Inst['mj_game_token'] = H,
                                    GameMgr.Inst['mj_game_uuid'] = N,
                                    K['playerreconnect'] = D,
                                    K['_setState'](f['EConnectState']['tryconnect']),
                                    K['load_over'] = !1,
                                    K['loaded_player_count'] = 0,
                                    K['real_player_count'] = 0,
                                    K['lb_index'] = 0,
                                    K['_fetch_gateway'](0);
                            }),
                            Laya['timer'].loop(300000, this, this['reportInfo']);
                    },
                    H['prototype']['reportInfo'] = function () {
                        this['connect_state'] == f['EConnectState']['connecting'] && GameMgr.Inst['postNewInfo2Server']('network_route', {
                            client_type: 'web',
                            route_type: 'game',
                            route_index: f['LobbyNetMgr']['root_id_lst'][f['LobbyNetMgr'].Inst['choosed_index']],
                            route_delay: Math.min(10000, Math['round'](app['NetAgent']['mj_network_delay'])),
                            connection_time: Math['round'](Date.now() - this['_connect_start_time']),
                            reconnect_count: this['_report_reconnect_count']
                        });
                    },
                    H['prototype']['Close'] = function () {
                        this['load_over'] = !1,
                            app.Log.log('MJNetMgr close'),
                            this['_setState'](f['EConnectState'].none),
                            app['NetAgent']['Close2MJ'](),
                            this.url = '',
                            Laya['timer']['clear'](this, this['reportInfo']);
                    },
                    H['prototype']['_OnConnent'] = function (H) {
                        app.Log.log('MJNetMgr _OnConnent event:' + H),
                            H == Laya['Event']['CLOSE'] || H == Laya['Event']['ERROR'] ? Laya['timer']['currTimer'] - this['lasterrortime'] > 100 && (this['lasterrortime'] = Laya['timer']['currTimer'], this['connect_state'] == f['EConnectState']['tryconnect'] ? this['_try_to_linknext']() : this['connect_state'] == f['EConnectState']['connecting'] ? view['DesktopMgr'].Inst['active'] ? (view['DesktopMgr'].Inst['duringReconnect'] = !0, this['_setState'](f['EConnectState']['reconnecting']), this['reconnect_count'] = 0, this['_Reconnect']()) : (this['_setState'](f['EConnectState']['disconnect']), uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](2008)), f['Scene_MJ'].Inst['ForceOut']()) : this['connect_state'] == f['EConnectState']['reconnecting'] && this['_Reconnect']()) : H == Laya['Event'].OPEN && (this['_connect_start_time'] = Date.now(), (this['connect_state'] == f['EConnectState']['tryconnect'] || this['connect_state'] == f['EConnectState']['reconnecting']) && ((this['connect_state'] = f['EConnectState']['tryconnect']) ? this['_report_reconnect_count'] = 0 : this['_report_reconnect_count']++, this['_setState'](f['EConnectState']['connecting']), this['is_ob'] ? this['_ConnectSuccessOb']() : this['_ConnectSuccess']()));
                    },
                    H['prototype']['_Reconnect'] = function () {
                        var H = this;
                        f['LobbyNetMgr'].Inst['connect_state'] == f['EConnectState'].none || f['LobbyNetMgr'].Inst['connect_state'] == f['EConnectState']['disconnect'] ? this['_setState'](f['EConnectState']['disconnect']) : f['LobbyNetMgr'].Inst['connect_state'] == f['EConnectState']['connecting'] && GameMgr.Inst['logined'] ? this['reconnect_count'] >= this['reconnect_span']['length'] ? this['_setState'](f['EConnectState']['disconnect']) : (Laya['timer'].once(this['reconnect_span'][this['reconnect_count']], this, function () {
                            H['connect_state'] == f['EConnectState']['reconnecting'] && (app.Log.log('MJNetMgr reconnect count:' + H['reconnect_count']), app['NetAgent']['connect2MJ'](H.url, Laya['Handler']['create'](H, H['_OnConnent'], null, !1), 'local' == H['server_location'] ? '/game-gateway' : '/game-gateway-zone'));
                        }), this['reconnect_count']++) : Laya['timer'].once(1000, this, this['_Reconnect']);
                    },
                    H['prototype']['_try_to_linknext'] = function () {
                        this['link_index']++,
                            this.url = '',
                            app.Log.log('mj _try_to_linknext(' + this['link_index'] + ') url.length=' + this.urls['length']),
                            this['link_index'] < 0 || this['link_index'] >= this.urls['length'] ? f['LobbyNetMgr'].Inst['polling_connect'] ? (this['lb_index']++, this['_fetch_gateway'](0)) : (this['_setState'](f['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && f['Scene_MJ'].Inst['ForceOut']()) : (app['NetAgent']['connect2MJ'](this.urls[this['link_index']].url, Laya['Handler']['create'](this, this['_OnConnent'], null, !1), 'local' == this['server_location'] ? '/game-gateway' : '/game-gateway-zone'), this.url = this.urls[this['link_index']].url);
                    },
                    H['prototype']['GetAuthData'] = function () {
                        return {
                            account_id: GameMgr.Inst['account_id'],
                            token: this['token'],
                            game_uuid: this['game_uuid'],
                            gift: CryptoJS['HmacSHA256'](this['token'] + GameMgr.Inst['account_id'] + this['game_uuid'], 'damajiang')['toString']()
                        };
                    },
                    H['prototype']['_fetch_gateway'] = function (H) {
                        var N = this;
                        if (f['LobbyNetMgr'].Inst['polling_connect'] && this['lb_index'] >= f['LobbyNetMgr'].Inst.urls['length'])
                            return uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](59)), this['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && f['Scene_MJ'].Inst['ForceOut'](), this['_setState'](f['EConnectState'].none), void 0;
                        this.urls = [],
                            this['link_index'] = -1,
                            app.Log.log('mj _fetch_gateway retry_count:' + H);
                        var Q = function (Q) {
                            var D = JSON['parse'](Q);
                            if (app.Log.log('mj _fetch_gateway func_success data = ' + Q), D['maintenance'])
                                N['_setState'](f['EConnectState'].none), uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](2009)), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && f['Scene_MJ'].Inst['ForceOut']();
                            else if (D['servers'] && D['servers']['length'] > 0) {
                                for (var K = D['servers'], b = f['Tools']['deal_gateway'](K), I = 0; I < b['length']; I++)
                                    N.urls.push({
                                        name: '___' + I,
                                        url: b[I]
                                    });
                                N['link_index'] = -1,
                                    N['_try_to_linknext']();
                            } else
                                1 > H ? Laya['timer'].once(1000, N, function () {
                                    N['_fetch_gateway'](H + 1);
                                }) : f['LobbyNetMgr'].Inst['polling_connect'] ? (N['lb_index']++, N['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](60)), N['_SendDebugInfo'](), view['DesktopMgr'].Inst && !view['DesktopMgr'].Inst['active'] && f['Scene_MJ'].Inst['ForceOut'](), N['_setState'](f['EConnectState'].none));
                        },
                            D = function () {
                                app.Log.log('mj _fetch_gateway func_error'),
                                    1 > H ? Laya['timer'].once(500, N, function () {
                                        N['_fetch_gateway'](H + 1);
                                    }) : f['LobbyNetMgr'].Inst['polling_connect'] ? (N['lb_index']++, N['_fetch_gateway'](0)) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](58)), N['_SendDebugInfo'](), view['DesktopMgr'].Inst['active'] || f['Scene_MJ'].Inst['ForceOut'](), N['_setState'](f['EConnectState'].none));
                            },
                            K = function (f) {
                                var H = new Laya['HttpRequest']();
                                H.once(Laya['Event']['COMPLETE'], N, function (f) {
                                    Q(f);
                                }),
                                    H.once(Laya['Event']['ERROR'], N, function () {
                                        D();
                                    });
                                var K = [];
                                K.push('If-Modified-Since'),
                                    K.push('0'),
                                    f += '?service=ws-game-gateway',
                                    f += GameMgr['inHttps'] ? '&protocol=ws&ssl=true' : '&protocol=ws&ssl=false',
                                    f += '&location=' + N['server_location'],
                                    f += '&rv=' + Math['floor'](10000000 * Math['random']()) + Math['floor'](10000000 * Math['random']()),
                                    H.send(f, '', 'get', 'text', K),
                                    app.Log.log('mj _fetch_gateway func_fetch url = ' + f);
                            };
                        f['LobbyNetMgr'].Inst['polling_connect'] ? K(f['LobbyNetMgr'].Inst.urls[this['lb_index']]) : K(f['LobbyNetMgr'].Inst['lb_url']);
                    },
                    H['prototype']['_setState'] = function (H) {
                        this['connect_state'] = H,
                            GameMgr['inRelease'] || null != uiscript['UI_Common'].Inst && (H == f['EConnectState'].none ? uiscript['UI_Common'].Inst['label_net_mj'].text = '' : H == f['EConnectState']['tryconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '尝试连接麻将服务器', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#000000') : H == f['EConnectState']['connecting'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正常', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#00ff00') : H == f['EConnectState']['disconnect'] ? (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：断开连接', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()) : H == f['EConnectState']['reconnecting'] && (uiscript['UI_Common'].Inst['label_net_mj'].text = '麻将服务器：正在重连', uiscript['UI_Common'].Inst['label_net_mj']['color'] = '#ff0000', uiscript['UI_Disconnect'].Inst && uiscript['UI_Disconnect'].Inst.show()));
                    },
                    H['prototype']['_ConnectSuccess'] = function () {
                        var H = this;
                        app.Log.log('MJNetMgr _ConnectSuccess '),
                            this['load_over'] = !1,
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authGame', this['GetAuthData'](), function (N, Q) {
                                if (N || Q['error'])
                                    uiscript['UIMgr'].Inst['showNetReqError']('authGame', N, Q), f['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                else {
                                    app.Log.log('麻将桌验证通过：' + JSON['stringify'](Q)),
                                        uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                                    // 强制打开便捷提示
                                    if (MMP.settings.setbianjietishi) {
                                        Q['game_config']['mode']['detail_rule']['bianjietishi'] = true;
                                    }
                                    // END
                                    var D = [],
                                        K = 0;
                                    view['DesktopMgr']['player_link_state'] = Q['state_list'];
                                    var b = f['Tools']['strOfLocalization'](2003),
                                        I = Q['game_config'].mode,
                                        q = view['ERuleMode']['Liqi4'];
                                    I.mode < 10 ? (q = view['ERuleMode']['Liqi4'], H['real_player_count'] = 4) : I.mode < 20 && (q = view['ERuleMode']['Liqi3'], H['real_player_count'] = 3);
                                    for (var a = 0; a < H['real_player_count']; a++)
                                        D.push(null);
                                    I['extendinfo'] && (b = f['Tools']['strOfLocalization'](2004)),
                                        I['detail_rule'] && I['detail_rule']['ai_level'] && (1 === I['detail_rule']['ai_level'] && (b = f['Tools']['strOfLocalization'](2003)), 2 === I['detail_rule']['ai_level'] && (b = f['Tools']['strOfLocalization'](2004)));
                                    for (var J = f['GameUtility']['get_default_ai_skin'](), k = f['GameUtility']['get_default_ai_character'](), a = 0; a < Q['seat_list']['length']; a++) {
                                        var r = Q['seat_list'][a];
                                        if (0 == r) {
                                            D[a] = {
                                                nickname: b,
                                                avatar_id: J,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: k,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: J,
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
                                                    D[a].avatar_id = skin.id;
                                                    D[a].character.charid = skin.character_id;
                                                    D[a].character.skin = skin.id;
                                                }
                                            }
                                            if (MMP.settings.showServer == true) {
                                                D[a].nickname = '[BOT]' + D[a].nickname;
                                            }
                                        } else {
                                            K++;
                                            for (var d = 0; d < Q['players']['length']; d++)
                                                if (Q['players'][d]['account_id'] == r) {
                                                    D[a] = Q['players'][d];
                                                    //修改牌桌上人物头像及皮肤
                                                    if (D[a].account_id == GameMgr.Inst.account_id) {
                                                        D[a].character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                                        D[a].avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                                        D[a].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                                        D[a].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                                        D[a].title = GameMgr.Inst.account_data.title;
                                                        if (MMP.settings.nickname != '') {
                                                            D[a].nickname = MMP.settings.nickname;
                                                        }
                                                    } else if (MMP.settings.randomPlayerDefSkin && (D[a].avatar_id == 400101 || D[a].avatar_id == 400201)) {
                                                        //玩家如果用了默认皮肤也随机换
                                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                                        // 修复皮肤错误导致无法进入游戏的bug
                                                        if (skin.id != 400000 && skin.id != 400001) {
                                                            D[a].avatar_id = skin.id;
                                                            D[a].character.charid = skin.character_id;
                                                            D[a].character.skin = skin.id;
                                                        }
                                                    }
                                                    if (MMP.settings.showServer == true) {
                                                        let server = game.Tools.get_zone_id(D[a].account_id);
                                                        if (server == 1) {
                                                            D[a].nickname = '[CN]' + D[a].nickname;
                                                        } else if (server == 2) {
                                                            D[a].nickname = '[JP]' + D[a].nickname;
                                                        } else if (server == 3) {
                                                            D[a].nickname = '[EN]' + D[a].nickname;
                                                        } else {
                                                            D[a].nickname = '[??]' + D[a].nickname;
                                                        }
                                                    }
                                                    // END
                                                    break;
                                                }
                                        }
                                    }
                                    for (var a = 0; a < H['real_player_count']; a++)
                                        null == D[a] && (D[a] = {
                                            account: 0,
                                            nickname: f['Tools']['strOfLocalization'](2010),
                                            avatar_id: J,
                                            level: {
                                                id: '10101'
                                            },
                                            level3: {
                                                id: '20101'
                                            },
                                            character: {
                                                charid: k,
                                                level: 0,
                                                exp: 0,
                                                views: [],
                                                skin: J,
                                                is_upgraded: !1
                                            }
                                        });
                                    H['loaded_player_count'] = Q['ready_id_list']['length'],
                                        H['_AuthSuccess'](D, Q['is_game_start'], Q['game_config']['toJSON']());
                                }
                            });
                    },
                    H['prototype']['_AuthSuccess'] = function (H, N, Q) {
                        var D = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.2),
                                app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                    round_id: view['DesktopMgr'].Inst['round_id'],
                                    step: view['DesktopMgr'].Inst['current_step']
                                }, function (H, N) {
                                    H || N['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', H, N), f['Scene_MJ'].Inst['ForceOut']()) : (app.Log.log('[syncGame] ' + JSON['stringify'](N)), N['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](2011)), f['Scene_MJ'].Inst['GameEnd']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.3), view['DesktopMgr'].Inst['fetchLinks'](), view['DesktopMgr'].Inst['Reset'](), view['DesktopMgr'].Inst['duringReconnect'] = !0, view['DesktopMgr'].Inst['syncGameByStep'](N['game_restore'])));
                                });
                        })) : f['Scene_MJ'].Inst['openMJRoom'](Q, H, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](Q)), H, GameMgr.Inst['account_id'], view['EMJMode'].play, Laya['Handler']['create'](D, function () {
                                N ? Laya['timer']['frameOnce'](10, D, function () {
                                    app.Log.log('重连信息2 round_id:-1 step:' + 1000000),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'syncGame', {
                                            round_id: '-1',
                                            step: 1000000
                                        }, function (H, N) {
                                            app.Log.log('syncGame ' + JSON['stringify'](N)),
                                                H || N['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('syncGame', H, N), f['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), view['DesktopMgr'].Inst['fetchLinks'](), D['_PlayerReconnectSuccess'](N));
                                        });
                                }) : Laya['timer']['frameOnce'](10, D, function () {
                                    app.Log.log('send enterGame'),
                                        view['DesktopMgr'].Inst['Reset'](),
                                        view['DesktopMgr'].Inst['duringReconnect'] = !0,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'enterGame', {}, function (H, N) {
                                            H || N['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('enterGame', H, N), f['Scene_MJ'].Inst['ForceOut']()) : (uiscript['UI_Loading'].Inst['setProgressVal'](1), app.Log.log('enterGame'), D['_EnterGame'](N), view['DesktopMgr'].Inst['fetchLinks']());
                                        });
                                });
                            }));
                        }), Laya['Handler']['create'](this, function (f) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.8 * f);
                        }, null, !1));
                    },
                    H['prototype']['_EnterGame'] = function (H) {
                        app.Log.log('正常进入游戏: ' + JSON['stringify'](H)),
                            H['is_end'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](2011)), f['Scene_MJ'].Inst['GameEnd']()) : H['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](H['game_restore']) : (this['load_over'] = !0, this['load_over'] && uiscript['UI_Loading'].Inst['enable'] && uiscript['UI_Loading'].Inst['showLoadCount'](this['loaded_player_count'], this['real_player_count']), view['DesktopMgr'].Inst['duringReconnect'] = !1, view['DesktopMgr'].Inst['StartChainAction'](0));
                    },
                    H['prototype']['_PlayerReconnectSuccess'] = function (H) {
                        app.Log.log('_PlayerReconnectSuccess data:' + JSON['stringify'](H)),
                            H['isEnd'] ? (uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](2011)), f['Scene_MJ'].Inst['GameEnd']()) : H['game_restore'] ? view['DesktopMgr'].Inst['syncGameByStep'](H['game_restore']) : (uiscript['UIMgr'].Inst['ShowErrorInfo'](f['Tools']['strOfLocalization'](2012)), f['Scene_MJ'].Inst['ForceOut']());
                    },
                    H['prototype']['_SendDebugInfo'] = function () { },
                    H['prototype']['OpenConnectObserve'] = function (H, N) {
                        var Q = this;
                        this['is_ob'] = !0,
                            uiscript['UI_Loading'].Inst.show('enter_mj'),
                            this['Close'](),
                            view['AudioMgr']['StopMusic'](),
                            Laya['timer'].once(500, this, function () {
                                Q['server_location'] = N,
                                    Q['ob_token'] = H,
                                    Q['_setState'](f['EConnectState']['tryconnect']),
                                    Q['lb_index'] = 0,
                                    Q['_fetch_gateway'](0);
                            });
                    },
                    H['prototype']['_ConnectSuccessOb'] = function () {
                        var H = this;
                        app.Log.log('MJNetMgr _ConnectSuccessOb '),
                            app['NetAgent']['sendReq2MJ']('FastTest', 'authObserve', {
                                token: this['ob_token']
                            }, function (N, Q) {
                                N || Q['error'] ? (uiscript['UIMgr'].Inst['showNetReqError']('authObserve', N, Q), f['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']()) : (app.Log.log('实时OB验证通过：' + JSON['stringify'](Q)), uiscript['UI_Loading'].Inst['setProgressVal'](0.3), uiscript['UI_Live_Broadcast'].Inst && uiscript['UI_Live_Broadcast'].Inst['clearPendingUnits'](), app['NetAgent']['sendReq2MJ']('FastTest', 'startObserve', {}, function (N, Q) {
                                    if (N || Q['error'])
                                        uiscript['UIMgr'].Inst['showNetReqError']('startObserve', N, Q), f['Scene_MJ'].Inst['GameEnd'](), view['BgmListMgr']['PlayLobbyBgm']();
                                    else {
                                        var D = Q.head,
                                            K = D['game_config'].mode,
                                            b = [],
                                            I = f['Tools']['strOfLocalization'](2003),
                                            q = view['ERuleMode']['Liqi4'];
                                        K.mode < 10 ? (q = view['ERuleMode']['Liqi4'], H['real_player_count'] = 4) : K.mode < 20 && (q = view['ERuleMode']['Liqi3'], H['real_player_count'] = 3);
                                        for (var a = 0; a < H['real_player_count']; a++)
                                            b.push(null);
                                        K['extendinfo'] && (I = f['Tools']['strOfLocalization'](2004)),
                                            K['detail_rule'] && K['detail_rule']['ai_level'] && (1 === K['detail_rule']['ai_level'] && (I = f['Tools']['strOfLocalization'](2003)), 2 === K['detail_rule']['ai_level'] && (I = f['Tools']['strOfLocalization'](2004)));
                                        for (var J = f['GameUtility']['get_default_ai_skin'](), k = f['GameUtility']['get_default_ai_character'](), a = 0; a < D['seat_list']['length']; a++) {
                                            var r = D['seat_list'][a];
                                            if (0 == r)
                                                b[a] = {
                                                    nickname: I,
                                                    avatar_id: J,
                                                    level: {
                                                        id: '10101'
                                                    },
                                                    level3: {
                                                        id: '20101'
                                                    },
                                                    character: {
                                                        charid: k,
                                                        level: 0,
                                                        exp: 0,
                                                        views: [],
                                                        skin: J,
                                                        is_upgraded: !1
                                                    }
                                                };
                                            else
                                                for (var d = 0; d < D['players']['length']; d++)
                                                    if (D['players'][d]['account_id'] == r) {
                                                        b[a] = D['players'][d];
                                                        break;
                                                    }
                                        }
                                        for (var a = 0; a < H['real_player_count']; a++)
                                            null == b[a] && (b[a] = {
                                                account: 0,
                                                nickname: f['Tools']['strOfLocalization'](2010),
                                                avatar_id: J,
                                                level: {
                                                    id: '10101'
                                                },
                                                level3: {
                                                    id: '20101'
                                                },
                                                character: {
                                                    charid: k,
                                                    level: 0,
                                                    exp: 0,
                                                    views: [],
                                                    skin: J,
                                                    is_upgraded: !1
                                                }
                                            });
                                        H['_StartObSuccuess'](b, Q['passed'], D['game_config']['toJSON'](), D['start_time']);
                                    }
                                }));
                            });
                    },
                    H['prototype']['_StartObSuccuess'] = function (H, N, Q, D) {
                        var K = this;
                        view['DesktopMgr'].Inst && view['DesktopMgr'].Inst['active'] ? (this['load_over'] = !0, Laya['timer'].once(500, this, function () {
                            app.Log.log('重连信息1 round_id:' + view['DesktopMgr'].Inst['round_id'] + ' step:' + view['DesktopMgr'].Inst['current_step']),
                                view['DesktopMgr'].Inst['Reset'](),
                                uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](D, N);
                        })) : (uiscript['UI_Loading'].Inst['setProgressVal'](0.4), f['Scene_MJ'].Inst['openMJRoom'](Q, H, Laya['Handler']['create'](this, function () {
                            view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](Q)), H, GameMgr.Inst['account_id'], view['EMJMode']['live_broadcast'], Laya['Handler']['create'](K, function () {
                                uiscript['UI_Loading'].Inst['setProgressVal'](0.9),
                                    Laya['timer'].once(1000, K, function () {
                                        GameMgr.Inst['EnterMJ'](),
                                            uiscript['UI_Loading'].Inst['setProgressVal'](0.95),
                                            uiscript['UI_Live_Broadcast'].Inst['startRealtimeLive'](D, N);
                                    });
                            }));
                        }), Laya['Handler']['create'](this, function (f) {
                            return uiscript['UI_Loading'].Inst['setProgressVal'](0.4 + 0.4 * f);
                        }, null, !1)));
                    },
                    H['_Inst'] = null,
                    H;
            }
                ();
            f['MJNetMgr'] = H;
        }
            (game || (game = {}));











        // 读取战绩
        !function (f) {
            var H = function (H) {
                function N() {
                    var f = H.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['both_ui']['otherplayerinfoUI']() : new ui['both_ui']['otherplayerinfo_enUI']()) || this;
                    return f['account_id'] = 0,
                        f['origin_x'] = 0,
                        f['origin_y'] = 0,
                        f.root = null,
                        f['title'] = null,
                        f['level'] = null,
                        f['btn_addfriend'] = null,
                        f['btn_report'] = null,
                        f['illust'] = null,
                        f.name = null,
                        f['detail_data'] = null,
                        f['achievement_data'] = null,
                        f['locking'] = !1,
                        f['tab_info4'] = null,
                        f['tab_info3'] = null,
                        f['tab_note'] = null,
                        f['tab_img_dark'] = '',
                        f['tab_img_chosen'] = '',
                        f['player_data'] = null,
                        f['tab_index'] = 1,
                        f['game_category'] = 1,
                        f['game_type'] = 1,
                        f['show_name'] = '',
                        N.Inst = f,
                        f;
                }
                return __extends(N, H),
                    N['prototype']['onCreate'] = function () {
                        var H = this;
                        'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tab_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tab_dark.png')) : (this['tab_img_chosen'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_chosen.png'), this['tab_img_dark'] = game['Tools']['localUISrc']('myres/bothui/info_tabheng_dark.png')),
                            this.root = this.me['getChildByName']('root'),
                            this['origin_x'] = this.root.x,
                            this['origin_y'] = this.root.y,
                            this['container_info'] = this.root['getChildByName']('container_info'),
                            this['title'] = new f['UI_PlayerTitle'](this['container_info']['getChildByName']('title'), 'UI_OtherPlayerInfo'),
                            this.name = this['container_info']['getChildByName']('name'),
                            this['level'] = new f['UI_Level'](this['container_info']['getChildByName']('rank'), 'UI_OtherPlayerInfo'),
                            this['detail_data'] = new f['UI_PlayerData'](this['container_info']['getChildByName']('data')),
                            this['achievement_data'] = new f['UI_Achievement_Light'](this['container_info']['getChildByName']('achievement')),
                            this['illust'] = new f['UI_Character_Skin'](this.root['getChildByName']('illust')['getChildByName']('illust')),
                            this['btn_addfriend'] = this['container_info']['getChildByName']('btn_add'),
                            this['btn_addfriend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                H['btn_addfriend']['visible'] = !1,
                                    H['btn_report'].x = 343,
                                    app['NetAgent']['sendReq2Lobby']('Lobby', 'applyFriend', {
                                        target_id: H['account_id']
                                    }, function () { });
                            }, null, !1),
                            this['btn_report'] = this['container_info']['getChildByName']('btn_report'),
                            this['btn_report']['clickHandler'] = new Laya['Handler'](this, function () {
                                f['UI_Report_Nickname'].Inst.show(H['account_id']);
                            }),
                            this.me['getChildAt'](0)['clickHandler'] = Laya['Handler']['create'](this, function () {
                                H['locking'] || H['close']();
                            }, null, !1),
                            this.root['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                H['close']();
                            }, null, !1),
                            this.note = new f['UI_PlayerNote'](this.root['getChildByName']('container_note'), null),
                            this['tab_info4'] = this.root['getChildByName']('tab_info4'),
                            this['tab_info4']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                H['locking'] || 1 != H['tab_index'] && H['changeMJCategory'](1);
                            }, null, !1),
                            this['tab_info3'] = this.root['getChildByName']('tab_info3'),
                            this['tab_info3']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                H['locking'] || 2 != H['tab_index'] && H['changeMJCategory'](2);
                            }, null, !1),
                            this['tab_note'] = this.root['getChildByName']('tab_note'),
                            this['tab_note']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                H['locking'] || 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'] && (game['Tools']['during_chat_close']() ? f['UIMgr'].Inst['ShowErrorInfo']('功能维护中，祝大家新年快乐') : H['container_info']['visible'] && (H['container_info']['visible'] = !1, H['tab_info4'].skin = H['tab_img_dark'], H['tab_info3'].skin = H['tab_img_dark'], H['tab_note'].skin = H['tab_img_chosen'], H['tab_index'] = 3, H.note.show()));
                            }, null, !1),
                            this['locking'] = !1;
                    },
                    N['prototype'].show = function (H, N, Q, D, K) {
                        var b = this;
                        void 0 === N && (N = 1),
                            void 0 === Q && (Q = 2),
                            void 0 === D && (D = 1),
                            void 0 === K && (K = ''),
                            GameMgr.Inst['BehavioralStatistics'](14),
                            this['account_id'] = H,
                            this['show_name'] = K,
                            this['enable'] = !0,
                            this['locking'] = !0,
                            this.root.y = this['origin_y'],
                            this['player_data'] = null,
                            f['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                b['locking'] = !1;
                            })),
                            this['detail_data']['reset'](),
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountStatisticInfo', {
                                account_id: H
                            }, function (N, Q) {
                                N || Q['error'] ? f['UIMgr'].Inst['showNetReqError']('fetchAccountStatisticInfo', N, Q) : f['UI_Shilian']['now_season_info'] && 1001 == f['UI_Shilian']['now_season_info']['season_id'] && 3 != f['UI_Shilian']['get_cur_season_state']() ? (b['detail_data']['setData'](Q), b['changeMJCategory'](b['tab_index'], b['game_category'], b['game_type'])) : app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountChallengeRankInfo', {
                                    account_id: H
                                }, function (H, N) {
                                    H || N['error'] ? f['UIMgr'].Inst['showNetReqError']('fetchAccountChallengeRankInfo', H, N) : (Q['season_info'] = N['season_info'], b['detail_data']['setData'](Q), b['changeMJCategory'](b['tab_index'], b['game_category'], b['game_type']));
                                });
                            }),
                            this.note['init_data'](H),
                            this['refreshBaseInfo'](),
                            this['btn_report']['visible'] = H != GameMgr.Inst['account_id'],
                            this['tab_index'] = N,
                            this['game_category'] = Q,
                            this['game_type'] = D,
                            this['container_info']['visible'] = !0,
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['tab_note']['visible'] = 'chs' != GameMgr['client_type'] && 'chs_t' != GameMgr['client_type'],
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    N['prototype']['refreshBaseInfo'] = function () {
                        var H = this;
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
                            }, function (N, Q) {
                                if (N || Q['error'])
                                    f['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', N, Q);
                                else {
                                    var D = Q['account'];
                                    //修复读取战绩信息时人物皮肤不一致问题 ----fxxk
                                    if (D.account_id == GameMgr.Inst.account_id) {
                                        D.avatar_id = uiscript.UI_Sushe.main_chara_info.skin,
                                            D.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            D.nickname = MMP.settings.nickname;
                                        }
                                    }
                                    //end
                                    H['player_data'] = D,
                                        H['account_id'] != GameMgr.Inst['account_id'] && H['show_name'] && (D['nickname'] = H['show_name']),
                                        game['Tools']['SetNickname'](H.name, D, !1, !!H['show_name']),
                                        H['title'].id = game['Tools']['titleLocalization'](D['account_id'], D['title']),
                                        H['level'].id = D['level'].id,
                                        H['level'].id = H['player_data'][1 == H['tab_index'] ? 'level' : 'level3'].id,
                                        H['level'].exp = H['player_data'][1 == H['tab_index'] ? 'level' : 'level3']['score'],
                                        H['illust'].me['visible'] = !0,
                                        H['account_id'] == GameMgr.Inst['account_id'] ? H['illust']['setSkin'](D['avatar_id'], 'waitingroom') : H['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](D['avatar_id']), 'waitingroom'),
                                        game['Tools']['is_same_zone'](GameMgr.Inst['account_id'], H['account_id']) && H['account_id'] != GameMgr.Inst['account_id'] && null == game['FriendMgr'].find(H['account_id']) ? (H['btn_addfriend']['visible'] = !0, H['btn_report'].x = 520) : (H['btn_addfriend']['visible'] = !1, H['btn_report'].x = 343),
                                        H.note.sign['setSign'](D['signature']),
                                        H['achievement_data'].show(!1, D['achievement_count']);
                                }
                            });
                    },
                    N['prototype']['changeMJCategory'] = function (f, H, N) {
                        void 0 === H && (H = 2),
                            void 0 === N && (N = 1),
                            this['tab_index'] = f,
                            this['container_info']['visible'] = !0,
                            this['detail_data']['changeMJCategory'](f, H, N),
                            this['tab_info4'].skin = 1 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_info3'].skin = 2 == this['tab_index'] ? this['tab_img_chosen'] : this['tab_img_dark'],
                            this['tab_note'].skin = this['tab_img_dark'],
                            this.note['close'](),
                            this['player_data'] ? (this['level'].id = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3'].id, this['level'].exp = this['player_data'][1 == this['tab_index'] ? 'level' : 'level3']['score']) : (this['level'].id = 1 == this['tab_index'] ? '10101' : '20101', this['level'].exp = 0);
                    },
                    N['prototype']['close'] = function () {
                        var H = this;
                        this['enable'] && (this['locking'] || (this['locking'] = !0, this['detail_data']['close'](), f['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                            H['locking'] = !1,
                                H['enable'] = !1;
                        }))));
                    },
                    N['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !0);
                    },
                    N['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_OtherPlayerInfo', !1),
                            this['detail_data']['close'](),
                            this['illust']['clear'](),
                            Laya['loader']['clearTextureRes'](this['level'].icon.skin);
                    },
                    N.Inst = null,
                    N;
            }
                (f['UIBase']);
            f['UI_OtherPlayerInfo'] = H;
        }
            (uiscript || (uiscript = {}));












        // 宿舍相关
        !function (f) {
            var H = function () {
                function H(H, Q) {
                    var D = this;
                    this['_scale'] = 1,
                        this['during_move'] = !1,
                        this['mouse_start_x'] = 0,
                        this['mouse_start_y'] = 0,
                        this.me = H,
                        this['container_illust'] = Q,
                        this['illust'] = this['container_illust']['getChildByName']('illust'),
                        this['container_move'] = H['getChildByName']('move'),
                        this['container_move'].on('mousedown', this, function () {
                            D['during_move'] = !0,
                                D['mouse_start_x'] = D['container_move']['mouseX'],
                                D['mouse_start_y'] = D['container_move']['mouseY'];
                        }),
                        this['container_move'].on('mousemove', this, function () {
                            D['during_move'] && (D.move(D['container_move']['mouseX'] - D['mouse_start_x'], D['container_move']['mouseY'] - D['mouse_start_y']), D['mouse_start_x'] = D['container_move']['mouseX'], D['mouse_start_y'] = D['container_move']['mouseY']);
                        }),
                        this['container_move'].on('mouseup', this, function () {
                            D['during_move'] = !1;
                        }),
                        this['container_move'].on('mouseout', this, function () {
                            D['during_move'] = !1;
                        }),
                        this['btn_close'] = H['getChildByName']('btn_close'),
                        this['btn_close']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            D['locking'] || D['close']();
                        }, null, !1),
                        this['scrollbar'] = H['getChildByName']('scrollbar')['scriptMap']['capsui.CScrollBar'],
                        this['scrollbar'].init(new Laya['Handler'](this, function (f) {
                            D['_scale'] = 1 * (1 - f) + 0.5,
                                D['illust']['scaleX'] = D['_scale'],
                                D['illust']['scaleY'] = D['_scale'],
                                D['scrollbar']['setVal'](f, 0);
                        })),
                        this['dongtai_kaiguan'] = new f['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            N.Inst['illust']['resetSkin'](),
                                D['illust']['scaleX'] = D['_scale'],
                                D['illust']['scaleY'] = D['_scale'];
                        }), new Laya['Handler'](this, function (f) {
                            N.Inst['illust']['playAnim'](f);
                        })),
                        this['dongtai_kaiguan']['setKaiguanPos'](43, -31);
                }
                return Object['defineProperty'](H['prototype'], 'scale', {
                    get: function () {
                        return this['_scale'];
                    },
                    set: function (f) {
                        this['_scale'] = f,
                            this['scrollbar']['setVal'](1 - (f - 0.5) / 1, 0);
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    H['prototype'].show = function (H) {
                        var Q = this;
                        this['locking'] = !0,
                            this['when_close'] = H,
                            this['illust_start_x'] = this['illust'].x,
                            this['illust_start_y'] = this['illust'].y,
                            this['illust_center_x'] = this['illust'].x + 984 - 446,
                            this['illust_center_y'] = this['illust'].y + 11 - 84,
                            this['container_illust']['getChildByName']('container_name')['visible'] = !1,
                            this['container_illust']['getChildByName']('container_name_en')['visible'] = !1,
                            this['container_illust']['getChildByName']('btn')['visible'] = !1,
                            N.Inst['stopsay'](),
                            this['scale'] = 1,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_center_x'],
                                y: this['illust_center_y']
                            }, 200),
                            f['UIBase']['anim_pop_out'](this['btn_close'], null),
                            this['during_move'] = !1,
                            Laya['timer'].once(250, this, function () {
                                Q['locking'] = !1;
                            }),
                            this.me['visible'] = !0,
                            this['dongtai_kaiguan']['refresh'](N.Inst['illust']['skin_id']);
                    },
                    H['prototype']['close'] = function () {
                        var H = this;
                        this['locking'] = !0,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? this['container_illust']['getChildByName']('container_name')['visible'] = !0 : this['container_illust']['getChildByName']('container_name_en')['visible'] = !0,
                            this['container_illust']['getChildByName']('btn')['visible'] = !0,
                            Laya['Tween'].to(this['illust'], {
                                x: this['illust_start_x'],
                                y: this['illust_start_y'],
                                scaleX: 1,
                                scaleY: 1
                            }, 200),
                            f['UIBase']['anim_pop_hide'](this['btn_close'], null),
                            Laya['timer'].once(250, this, function () {
                                H['locking'] = !1,
                                    H.me['visible'] = !1,
                                    H['when_close'].run();
                            });
                    },
                    H['prototype'].move = function (f, H) {
                        var N = this['illust'].x + f,
                            Q = this['illust'].y + H;
                        N < this['illust_center_x'] - 600 ? N = this['illust_center_x'] - 600 : N > this['illust_center_x'] + 600 && (N = this['illust_center_x'] + 600),
                            Q < this['illust_center_y'] - 1200 ? Q = this['illust_center_y'] - 1200 : Q > this['illust_center_y'] + 800 && (Q = this['illust_center_y'] + 800),
                            this['illust'].x = N,
                            this['illust'].y = Q;
                    },
                    H;
            }
                (),
                N = function (N) {
                    function Q() {
                        var f = N.call(this, new ui['lobby']['susheUI']()) || this;
                        return f['contianer_illust'] = null,
                            f['illust'] = null,
                            f['illust_rect'] = null,
                            f['container_name'] = null,
                            f['label_name'] = null,
                            f['label_cv'] = null,
                            f['label_cv_title'] = null,
                            f['container_page'] = null,
                            f['container_look_illust'] = null,
                            f['page_select_character'] = null,
                            f['page_visit_character'] = null,
                            f['origin_illust_x'] = 0,
                            f['chat_id'] = 0,
                            f['container_chat'] = null,
                            f['_select_index'] = 0,
                            f['sound_id'] = null,
                            f['chat_block'] = null,
                            f['illust_showing'] = !0,
                            Q.Inst = f,
                            f;
                    }
                    return __extends(Q, N),
                        Q['onMainSkinChange'] = function () {
                            var f = cfg['item_definition'].skin.get(GameMgr.Inst['account_data']['avatar_id']);
                            f && f['spine_type'] && CatFoodSpine['SpineMgr'].Inst['changeSpineImportant'](game['Tools']['localUISrc'](f.path) + '/spine');
                        },
                        Q['randomDesktopID'] = function () {
                            var H = f['UI_Sushe']['commonViewList'][f['UI_Sushe']['using_commonview_index']];
                            if (this['now_mjp_id'] = game['GameUtility']['get_view_default_item_id'](game['EView'].mjp), this['now_desktop_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['desktop']), this['now_mjp_surface_id'] = game['GameUtility']['get_view_default_item_id'](game['EView']['mjp_surface']), H)
                                for (var N = 0; N < H['length']; N++)
                                    H[N].slot == game['EView'].mjp ? this['now_mjp_id'] = H[N].type ? H[N]['item_id_list'][Math['floor'](Math['random']() * H[N]['item_id_list']['length'])] : H[N]['item_id'] : H[N].slot == game['EView']['desktop'] ? this['now_desktop_id'] = H[N].type ? H[N]['item_id_list'][Math['floor'](Math['random']() * H[N]['item_id_list']['length'])] : H[N]['item_id'] : H[N].slot == game['EView']['mjp_surface'] && (this['now_mjp_surface_id'] = H[N].type ? H[N]['item_id_list'][Math['floor'](Math['random']() * H[N]['item_id_list']['length'])] : H[N]['item_id']);
                        },
                        Q.init = function (H) {
                            var N = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCharacterInfo', {}, function (D, K) {
                                if (D || K['error'])
                                    f['UIMgr'].Inst['showNetReqError']('fetchCharacterInfo', D, K);
                                else {
                                    if (app.Log.log('fetchCharacterInfo: ' + JSON['stringify'](K)), K = JSON['parse'](JSON['stringify'](K)), K['main_character_id'] && K['characters']) {
                                        //if (N['characters'] = [], K['characters'])
                                        //    for (var b = 0; b < K['characters']['length']; b++)
                                        //        N['characters'].push(K['characters'][b]);
                                        //if (N['skin_map'] = {}, K['skins'])
                                        //    for (var b = 0; b < K['skins']['length']; b++)
                                        //        N['skin_map'][K['skins'][b]] = 1;
                                        //N['main_character_id'] = K['main_character_id'];
                                        //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                        fake_data.char_id = K.main_character_id;
                                        for (let count = 0; count < K.characters.length; count++) {
                                            if (K.characters[count].charid == K.main_character_id) {
                                                if (K.characters[count].extra_emoji !== undefined) {
                                                    fake_data.emoji = K.characters[count].extra_emoji;
                                                } else {
                                                    fake_data.emoji = [];
                                                }
                                                fake_data.skin = K.skins[count];
                                                fake_data.exp = K.characters[count].exp;
                                                fake_data.level = K.characters[count].level;
                                                fake_data.is_upgraded = K.characters[count].is_upgraded;
                                                break;
                                            }
                                        }
                                        N.characters = [];

                                        for (let count = 1; count <= cfg.item_definition.character['rows_'].length; count++) {
                                            let id = 200000 + count;
                                            let skin = 400001 + count * 100;
                                            let emoji = [];
                                            let group = cfg.character.emoji.getGroup(id);
                                            if (group !== undefined) {
                                                group.forEach((element) => {
                                                    emoji.push(element.sub_id);
                                                });
                                                N.characters.push({
                                                    charid: id,
                                                    level: 5,
                                                    exp: 0,
                                                    skin: skin,
                                                    is_upgraded: 1,
                                                    extra_emoji: emoji,
                                                    rewarded_level: [1, 2, 3, 4, 5]
                                                });
                                            }
                                        }
                                        let skins = cfg.item_definition.skin['rows_'];
                                        skins.forEach((element) => {
                                            uiscript.UI_Sushe.add_skin(element['id']);
                                        });
                                        for (let skinitem in MMP.settings.characters) {
                                            uiscript.UI_Sushe.characters[skinitem].skin = MMP.settings.characters[skinitem];
                                        }
                                        N.main_character_id = MMP.settings.character;
                                        GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                        uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                        N.star_chars = MMP.settings.star_chars;
                                        K.character_sort = MMP.settings.star_chars;
                                        // END
                                    } else
                                        N['characters'] = [], N['characters'].push({
                                            charid: '200001',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400101',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), N['characters'].push({
                                            charid: '200002',
                                            level: 0,
                                            exp: 0,
                                            views: [],
                                            skin: '400201',
                                            is_upgraded: !1,
                                            extra_emoji: [],
                                            rewarded_level: []
                                        }), N['skin_map']['400101'] = 1, N['skin_map']['400201'] = 1, N['main_character_id'] = '200001';
                                    if (N['send_gift_count'] = 0, N['send_gift_limit'] = 0, K['send_gift_count'] && (N['send_gift_count'] = K['send_gift_count']), K['send_gift_limit'] && (N['send_gift_limit'] = K['send_gift_limit']), K['finished_endings'])
                                        for (var b = 0; b < K['finished_endings']['length']; b++)
                                            N['finished_endings_map'][K['finished_endings'][b]] = 1;
                                    if (K['rewarded_endings'])
                                        for (var b = 0; b < K['rewarded_endings']['length']; b++)
                                            N['rewarded_endings_map'][K['rewarded_endings'][b]] = 1;
                                    if (N['star_chars'] = [], K['character_sort'] && (N['star_chars'] = K['character_sort']), Q['hidden_characters_map'] = {}, K['hidden_characters'])
                                        for (var I = 0, q = K['hidden_characters']; I < q['length']; I++) {
                                            var a = q[I];
                                            Q['hidden_characters_map'][a] = 1;
                                        }
                                    H.run();
                                }
                            }), //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAllCommonViews', {}, function (H, Q) {
                                //if (H || Q['error'])
                                //    f['UIMgr'].Inst['showNetReqError']('fetchAllCommonViews', H, Q);
                                //else {
                                //    N['using_commonview_index'] = Q.use,
                                //    N['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                                //    var D = Q['views'];
                                //    if (D)
                                //        for (var K = 0; K < D['length']; K++) {
                                //            var b = D[K]['values'];
                                //            b && (N['commonViewList'][D[K]['index']] = b);
                                //        }
                                //    N['randomDesktopID'](),

                                N.commonViewList = MMP.settings.commonViewList;
                            N.using_commonview_index = MMP.settings.using_commonview_index;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view']();
                            GameMgr.Inst['load_touming_mjp_view']();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            uiscript.UI_Sushe.randomDesktopID();
                            //}
                            //})

                        },
                        Q['onFetchSuccess'] = function (f) {
                            var H = f['character_info'];
                            if (H) {
                                if (H['main_character_id'] && H['characters']) {
                                    //if (this['characters'] = [], H['characters'])
                                    //    for (var N = 0; N < H['characters']['length']; N++)
                                    //        this['characters'].push(H['characters'][N]);
                                    //if (this['skin_map'] = {}, H['skins'])
                                    //    for (var N = 0; N < H['skins']['length']; N++)
                                    //        this['skin_map'][H['skins'][N]] = 1;
                                    //this['main_character_id'] = H['main_character_id'];
                                    //人物初始化修改寮舍人物（皮肤好感额外表情）----fxxk
                                    fake_data.char_id = H.main_character_id;
                                    for (let count = 0; count < H.characters.length; count++) {
                                        if (H.characters[count].charid == H.main_character_id) {
                                            if (H.characters[count].extra_emoji !== undefined) {
                                                fake_data.emoji = H.characters[count].extra_emoji;
                                            } else {
                                                fake_data.emoji = [];
                                            }
                                            fake_data.skin = H.skins[count];
                                            fake_data.exp = H.characters[count].exp;
                                            fake_data.level = H.characters[count].level;
                                            fake_data.is_upgraded = H.characters[count].is_upgraded;
                                            break;
                                        }
                                    }
                                    this.characters = [];

                                    for (let count = 1; count <= cfg.item_definition.character['rows_'].length; count++) {
                                        let id = 200000 + count;
                                        let skin = 400001 + count * 100;
                                        let emoji = [];
                                        let group = cfg.character.emoji.getGroup(id);
                                        if (group !== undefined) {
                                            group.forEach((element) => {
                                                emoji.push(element.sub_id);
                                            });
                                            this.characters.push({
                                                charid: id,
                                                level: 5,
                                                exp: 0,
                                                skin: skin,
                                                is_upgraded: 1,
                                                extra_emoji: emoji,
                                                rewarded_level: [1, 2, 3, 4, 5]
                                            });
                                        }
                                    }
                                    let skins = cfg.item_definition.skin['rows_'];
                                    skins.forEach((element) => {
                                        uiscript.UI_Sushe.add_skin(element['id']);
                                    });
                                    for (let skinitem in MMP.settings.characters) {
                                        uiscript.UI_Sushe.characters[skinitem].skin = MMP.settings.characters[skinitem];
                                    }
                                    this.main_character_id = MMP.settings.character;
                                    GameMgr.Inst.account_data.avatar_id = MMP.settings.characters[MMP.settings.character - 200001];
                                    uiscript.UI_Sushe.star_chars = MMP.settings.star_chars;
                                    this.star_chars = MMP.settings.star_chars;
                                    H.character_sort = MMP.settings.star_chars;
                                    // END
                                } else
                                    this['characters'] = [], this['characters'].push({
                                        charid: '200001',
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: '400101',
                                        is_upgraded: !1,
                                        extra_emoji: [],
                                        rewarded_level: []
                                    }), this['characters'].push({
                                        charid: '200002',
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: '400201',
                                        is_upgraded: !1,
                                        extra_emoji: [],
                                        rewarded_level: []
                                    }), this['skin_map']['400101'] = 1, this['skin_map']['400201'] = 1, this['main_character_id'] = '200001';
                                if (this['send_gift_count'] = 0, this['send_gift_limit'] = 0, H['send_gift_count'] && (this['send_gift_count'] = H['send_gift_count']), H['send_gift_limit'] && (this['send_gift_limit'] = H['send_gift_limit']), H['finished_endings'])
                                    for (var N = 0; N < H['finished_endings']['length']; N++)
                                        this['finished_endings_map'][H['finished_endings'][N]] = 1;
                                if (H['rewarded_endings'])
                                    for (var N = 0; N < H['rewarded_endings']['length']; N++)
                                        this['rewarded_endings_map'][H['rewarded_endings'][N]] = 1;
                                if (this['star_chars'] = [], H['character_sort'] && 0 != H['character_sort']['length'] && (this['star_chars'] = H['character_sort']), Q['hidden_characters_map'] = {}, H['hidden_characters'])
                                    for (var D = 0, K = H['hidden_characters']; D < K['length']; D++) {
                                        var b = K[D];
                                        Q['hidden_characters_map'][b] = 1;
                                    }
                            }
                            var I = f['all_common_views'];

                            // if (I) {
                            //     this['using_commonview_index'] = I.use,
                            //         this['commonViewList'] = [[], [], [], [], [], [], [], [], [], []];
                            //     var q = I['views'];
                            //     if (q)
                            //         for (var N = 0; N < q['length']; N++) {
                            //             var a = q[N]['values'];
                            //             a && (this['commonViewList'][q[N]['index']] = a);
                            //         }
                            //     this['randomDesktopID'](),
                            //         GameMgr.Inst['load_mjp_view'](),
                            //         GameMgr.Inst['load_touming_mjp_view']();
                            // }
                            this.commonViewList = MMP.settings.commonViewList;
                            this.using_commonview_index = MMP.settings.using_commonview_index;
                            GameMgr.Inst.account_data.title = MMP.settings.title;
                            GameMgr.Inst['load_mjp_view']();
                            GameMgr.Inst['load_touming_mjp_view']();
                            GameMgr.Inst.account_data.avatar_frame = getAvatar_id();
                            this.randomDesktopID();
                        },
                        Q['on_data_updata'] = function (H) {
                            if (H['character']) {
                                var N = JSON['parse'](JSON['stringify'](H['character']));
                                if (N['characters'])
                                    for (var Q = N['characters'], D = 0; D < Q['length']; D++) {
                                        for (var K = !1, b = 0; b < this['characters']['length']; b++)
                                            if (this['characters'][b]['charid'] == Q[D]['charid']) {
                                                this['characters'][b] = Q[D],
                                                    f['UI_Sushe_Visit'].Inst && f['UI_Sushe_Visit'].Inst['chara_info'] && f['UI_Sushe_Visit'].Inst['chara_info']['charid'] == this['characters'][b]['charid'] && (f['UI_Sushe_Visit'].Inst['chara_info'] = this['characters'][b]),
                                                    K = !0;
                                                break;
                                            }
                                        K || this['characters'].push(Q[D]);
                                    }
                                if (N['skins'])
                                    for (var I = N['skins'], D = 0; D < I['length']; D++)
                                        this['skin_map'][I[D]] = 1;
                                // START
                                uiscript['UI_Bag'].Inst['on_skin_change']();
                                // END
                                if (N['finished_endings']) {
                                    for (var q = N['finished_endings'], D = 0; D < q['length']; D++)
                                        this['finished_endings_map'][q[D]] = 1;
                                    f['UI_Sushe_Visit'].Inst;
                                }
                                if (N['rewarded_endings']) {
                                    for (var q = N['rewarded_endings'], D = 0; D < q['length']; D++)
                                        this['rewarded_endings_map'][q[D]] = 1;
                                    f['UI_Sushe_Visit'].Inst;
                                }
                            }
                        },
                        Q['chara_owned'] = function (f) {
                            for (var H = 0; H < this['characters']['length']; H++)
                                if (this['characters'][H]['charid'] == f)
                                    return !0;
                            return !1;
                        },
                        Q['skin_owned'] = function (f) {
                            return this['skin_map']['hasOwnProperty'](f['toString']());
                        },
                        Q['add_skin'] = function (f) {
                            this['skin_map'][f] = 1;
                        },
                        Object['defineProperty'](Q, 'main_chara_info', {
                            get: function () {
                                for (var f = 0; f < this['characters']['length']; f++)
                                    if (this['characters'][f]['charid'] == this['main_character_id'])
                                        return this['characters'][f];
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Q['on_view_remove'] = function (f) {
                            for (var H = 0; H < this['commonViewList']['length']; H++)
                                for (var N = this['commonViewList'][H], Q = 0; Q < N['length']; Q++)
                                    if (N[Q]['item_id'] == f && (N[Q]['item_id'] = game['GameUtility']['get_view_default_item_id'](N[Q].slot)), N[Q]['item_id_list']) {
                                        for (var D = 0; D < N[Q]['item_id_list']['length']; D++)
                                            if (N[Q]['item_id_list'][D] == f) {
                                                N[Q]['item_id_list']['splice'](D, 1);
                                                break;
                                            }
                                        0 == N[Q]['item_id_list']['length'] && (N[Q].type = 0);
                                    }
                            var K = cfg['item_definition'].item.get(f);
                            K.type == game['EView']['head_frame'] && GameMgr.Inst['account_data']['avatar_frame'] == f && (GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_default_item_id'](game['EView']['head_frame']));
                        },
                        Q['add_finish_ending'] = function (f) {
                            this['finished_endings_map'][f] = 1;
                        },
                        Q['add_reward_ending'] = function (f) {
                            this['rewarded_endings_map'][f] = 1;
                        },
                        Q['check_all_char_repoint'] = function () {
                            for (var f = 0; f < Q['characters']['length']; f++)
                                if (this['check_char_redpoint'](Q['characters'][f]))
                                    return !0;
                            return !1;
                        },
                        Q['check_char_redpoint'] = function (f) {
                            // 去除小红点
                            //if (Q['hidden_characters_map'][f['charid']])
                            return !1;
                            //END
                            var H = cfg.spot.spot['getGroup'](f['charid']);
                            if (H)
                                for (var N = 0; N < H['length']; N++) {
                                    var D = H[N];
                                    if (!(D['is_married'] && !f['is_upgraded'] || !D['is_married'] && f['level'] < D['level_limit']) && 2 == D.type) {
                                        for (var K = !0, b = 0; b < D['jieju']['length']; b++)
                                            if (D['jieju'][b] && Q['finished_endings_map'][D['jieju'][b]]) {
                                                if (!Q['rewarded_endings_map'][D['jieju'][b]])
                                                    return !0;
                                                K = !1;
                                            }
                                        if (K)
                                            return !0;
                                    }
                                }
                            var I = cfg['item_definition']['character'].get(f['charid']);
                            if (I && I.ur)
                                for (var q = cfg['level_definition']['character']['getGroup'](f['charid']), a = 1, J = 0, k = q; J < k['length']; J++) {
                                    var r = k[J];
                                    if (a > f['level'])
                                        return;
                                    if (r['reward'] && (!f['rewarded_level'] || -1 == f['rewarded_level']['indexOf'](a)))
                                        return !0;
                                    a++;
                                }
                            return !1;
                        },
                        Q['is_char_star'] = function (f) {
                            return -1 != this['star_chars']['indexOf'](f);
                        },
                        Q['change_char_star'] = function (f) {
                            var H = this['star_chars']['indexOf'](f);
                            -1 != H ? this['star_chars']['splice'](H, 1) : this['star_chars'].push(f);
                            // 屏蔽网络请求
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'updateCharacterSort', {
                            //    sort: this['star_chars']
                            //}, function () {});
                            // END
                        },
                        Object['defineProperty'](Q['prototype'], 'select_index', {
                            get: function () {
                                return this['_select_index'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Q['prototype']['reset_select_index'] = function () {
                            this['_select_index'] = -1;
                        },
                        Q['prototype']['onCreate'] = function () {
                            var N = this;
                            this['contianer_illust'] = this.me['getChildByName']('illust'),
                                this['illust'] = new f['UI_Character_Skin'](this['contianer_illust']['getChildByName']('illust')['getChildByName']('illust')),
                                this['illust']['setType']('liaoshe'),
                                this['illust_rect'] = f['UIRect']['CreateFromSprite'](this['illust'].me),
                                this['container_chat'] = this['contianer_illust']['getChildByName']('chat'),
                                this['chat_block'] = new f['UI_Character_Chat'](this['container_chat'], !0),
                                this['contianer_illust']['getChildByName']('btn')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!N['page_visit_character'].me['visible'] || !N['page_visit_character']['cannot_click_say'])
                                        if (N['illust']['onClick'](), N['sound_id'])
                                            N['stopsay']();
                                        else {
                                            if (!N['illust_showing'])
                                                return;
                                            N.say('lobby_normal');
                                        }
                                }, null, !1),
                                this['container_name'] = null,
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['container_name'] = this['contianer_illust']['getChildByName']('container_name'), this['contianer_illust']['getChildByName']('container_name_en')['visible'] = !1, this['label_cv_title'] = this['container_name']['getChildByName']('label_CV_title'), 'chs_t' == GameMgr['client_type'] && this['label_cv_title']['scale'](0.98, 0.98)) : (this['container_name'] = this['contianer_illust']['getChildByName']('container_name_en'), this['contianer_illust']['getChildByName']('container_name')['visible'] = !1),
                                this['label_name'] = this['container_name']['getChildByName']('label_name'),
                                this['label_cv'] = this['container_name']['getChildByName']('label_CV'),
                                'kr' == GameMgr['client_language'] && (this['label_cv']['scaleX'] *= 0.8, this['label_cv']['scaleY'] *= 0.8),
                                this['origin_illust_x'] = this['contianer_illust'].x,
                                this['container_page'] = this.me['getChildByName']('container_page'),
                                this['page_select_character'] = new f['UI_Sushe_Select'](),
                                this['container_page']['addChild'](this['page_select_character'].me),
                                this['page_visit_character'] = new f['UI_Sushe_Visit'](),
                                this['container_page']['addChild'](this['page_visit_character'].me),
                                this['container_look_illust'] = new H(this.me['getChildByName']('look_illust'), this['contianer_illust']);
                        },
                        Q['prototype'].show = function (H) {
                            f['UI_Activity_SevenDays']['task_done'](1),
                                GameMgr.Inst['BehavioralStatistics'](15),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['page_visit_character'].me['visible'] = !1,
                                this['container_look_illust'].me['visible'] = !1;
                            for (var N = 0, D = 0; D < Q['characters']['length']; D++)
                                if (Q['characters'][D]['charid'] == Q['main_character_id']) {
                                    N = D;
                                    break;
                                }
                            0 == H ? (this['change_select'](N), this['show_page_select']()) : (this['_select_index'] = -1, this['illust_showing'] = !1, this['contianer_illust']['visible'] = !1, this['page_select_character'].show(1));
                        },
                        Q['prototype']['starup_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character']['star_up_back'](Q['characters'][this['_select_index']]),
                                this['page_visit_character']['show_levelup']();
                        },
                        Q['prototype']['spot_back'] = function () {
                            this['enable'] = !0,
                                this['change_select'](this['_select_index']),
                                this['page_visit_character'].show(Q['characters'][this['_select_index']], 2);
                        },
                        Q['prototype']['go2Lobby'] = function () {
                            this['close'](Laya['Handler']['create'](this, function () {
                                f['UIMgr'].Inst['showLobby']();
                            }));
                        },
                        Q['prototype']['close'] = function (H) {
                            var N = this;
                            this['illust_showing'] && f['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 150, 0),
                                Laya['timer'].once(150, this, function () {
                                    N['enable'] = !1,
                                        H && H.run();
                                });
                        },
                        Q['prototype']['onDisable'] = function () {
                            view['AudioMgr']['refresh_music_volume'](!1),
                                this['illust']['clear'](),
                                this['stopsay'](),
                                this['container_look_illust'].me['visible'] && this['container_look_illust']['close']();
                        },
                        Q['prototype']['hide_illust'] = function () {
                            var H = this;
                            this['illust_showing'] && (this['illust_showing'] = !1, f['UIBase']['anim_alpha_out'](this['contianer_illust'], {
                                x: -30
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                H['contianer_illust']['visible'] = !1;
                            })));
                        },
                        Q['prototype']['open_illust'] = function () {
                            if (!this['illust_showing'])
                                if (this['illust_showing'] = !0, this['_select_index'] >= 0)
                                    this['contianer_illust']['visible'] = !0, this['contianer_illust']['alpha'] = 1, f['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                        x: -30
                                    }, 200);
                                else {
                                    for (var H = 0, N = 0; N < Q['characters']['length']; N++)
                                        if (Q['characters'][N]['charid'] == Q['main_character_id']) {
                                            H = N;
                                            break;
                                        }
                                    this['change_select'](H);
                                }
                        },
                        Q['prototype']['show_page_select'] = function () {
                            this['page_select_character'].show(0);
                        },
                        Q['prototype']['show_page_visit'] = function (f) {
                            void 0 === f && (f = 0),
                                this['page_visit_character'].show(Q['characters'][this['_select_index']], f);
                        },
                        Q['prototype']['change_select'] = function (H) {
                            this['_select_index'] = H,
                                this['illust']['clear'](),
                                this['illust_showing'] = !0;
                            var N = Q['characters'][H],
                                D = cfg['item_definition']['character'].get(N['charid']);
                            'chs' == GameMgr['client_language'] && (this['label_name'].font = -1 != Q['chs_fengyu_name_lst']['indexOf'](N['charid']) ? 'fengyu' : 'hanyi', this['label_cv'].font = -1 != Q['chs_fengyu_cv_lst']['indexOf'](N['charid']) ? 'fengyu' : 'hanyi'),
                                'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this['label_name'].text = D['name_' + GameMgr['client_language']]['replace']('-', '|')['replace'](/\./g, '·'), this['label_cv'].text = D['desc_cv_' + GameMgr['client_language']], this['label_cv_title'].text = 'CV', 'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_name'].font ? this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](0.9, 0.9), this['label_name']['leading'] = -8) : (this['label_name']['scale'](1.2, 1.2), this['label_name']['leading'] = 0) : this['label_name'].text['length'] > 6 ? (this['label_name']['scale'](1.1, 1.1), this['label_name']['leading'] = -14) : (this['label_name']['scale'](1.25, 1.25), this['label_name']['leading'] = -3), this['label_cv']['height'] = 600, 'chs_t' == GameMgr['client_language'] || 'fengyu' == this['label_cv'].font ? (this['label_cv']['scale'](1, 1), this['label_cv']['leading'] = -4, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX']) : (this['label_cv']['scale'](1.1, 1.1), this['label_cv']['leading'] = -9, this['label_cv_title'].y = 360 - this['label_cv']['textField']['textHeight'] / 2 * this['label_cv']['scaleX'])) : (this['label_name'].text = D['name_' + GameMgr['client_language']], this['label_cv'].text = 'CV:' + D['desc_cv_' + GameMgr['client_language']]);
                            var K = new f['UIRect']();
                            K.x = this['illust_rect'].x,
                                K.y = this['illust_rect'].y,
                                K['width'] = this['illust_rect']['width'],
                                K['height'] = this['illust_rect']['height'],
                                this['illust']['setRect'](K),
                                this['illust']['setSkin'](N.skin, 'full'),
                                this['contianer_illust']['visible'] = !0,
                                Laya['Tween']['clearAll'](this['contianer_illust']),
                                this['contianer_illust'].x = this['origin_illust_x'],
                                this['contianer_illust']['alpha'] = 1,
                                f['UIBase']['anim_alpha_in'](this['contianer_illust'], {
                                    x: -30
                                }, 230),
                                this['stopsay']();
                            var b = cfg['item_definition'].skin.get(N.skin);
                            b && b['spine_type'] ? (this['page_select_character']['changeKaiguanShow'](!0), this['container_look_illust']['dongtai_kaiguan'].show(this['illust']['skin_id'])) : (this['page_select_character']['changeKaiguanShow'](!1), this['container_look_illust']['dongtai_kaiguan'].hide());
                        },
                        Q['prototype']['onChangeSkin'] = function (f) {
                            Q['characters'][this['_select_index']].skin = f,
                                this['change_select'](this['_select_index']),
                                Q['characters'][this['_select_index']]['charid'] == Q['main_character_id'] && (GameMgr.Inst['account_data']['avatar_id'] = f, Q['onMainSkinChange']());
                            // 屏蔽换肤请求
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                            //    character_id: Q['characters'][this['_select_index']]['charid'],
                            //    skin: f
                            //}, function () {});
                            // 保存皮肤
                        },
                        Q['prototype'].say = function (f) {
                            var H = this,
                                N = Q['characters'][this['_select_index']];
                            this['chat_id']++;
                            var D = this['chat_id'],
                                K = view['AudioMgr']['PlayCharactorSound'](N, f, Laya['Handler']['create'](this, function () {
                                    Laya['timer'].once(1000, H, function () {
                                        D == H['chat_id'] && H['stopsay']();
                                    });
                                }));
                            K && (this['chat_block'].show(K['words']), this['sound_id'] = K['audio_id']);
                        },
                        Q['prototype']['stopsay'] = function () {
                            this['chat_block']['close'](!1),
                                this['sound_id'] && (view['AudioMgr']['StopAudio'](this['sound_id']), this['sound_id'] = null);
                        },
                        Q['prototype']['to_look_illust'] = function () {
                            var f = this;
                            this['container_look_illust'].show(Laya['Handler']['create'](this, function () {
                                f['illust']['playAnim']('idle'),
                                    f['page_select_character'].show(0);
                            }));
                        },
                        Q['prototype']['jump_to_char_skin'] = function (H, N) {
                            var D = this;
                            if (void 0 === H && (H = -1), void 0 === N && (N = null), H >= 0)
                                for (var K = 0; K < Q['characters']['length']; K++)
                                    if (Q['characters'][K]['charid'] == H) {
                                        this['change_select'](K);
                                        break;
                                    }
                            f['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                Q.Inst['show_page_visit'](),
                                    D['page_visit_character']['show_pop_skin'](),
                                    D['page_visit_character']['set_jump_callback'](N);
                            }));
                        },
                        Q['prototype']['jump_to_char_qiyue'] = function (H) {
                            var N = this;
                            if (void 0 === H && (H = -1), H >= 0)
                                for (var D = 0; D < Q['characters']['length']; D++)
                                    if (Q['characters'][D]['charid'] == H) {
                                        this['change_select'](D);
                                        break;
                                    }
                            f['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                Q.Inst['show_page_visit'](),
                                    N['page_visit_character']['show_qiyue']();
                            }));
                        },
                        Q['prototype']['jump_to_char_gift'] = function (H) {
                            var N = this;
                            if (void 0 === H && (H = -1), H >= 0)
                                for (var D = 0; D < Q['characters']['length']; D++)
                                    if (Q['characters'][D]['charid'] == H) {
                                        this['change_select'](D);
                                        break;
                                    }
                            f['UI_Sushe_Select'].Inst['close'](Laya['Handler']['create'](this, function () {
                                Q.Inst['show_page_visit'](),
                                    N['page_visit_character']['show_gift']();
                            }));
                        },
                        Q['characters'] = [],
                        Q['chs_fengyu_name_lst'] = ['200040', '200043', '200090'],
                        Q['chs_fengyu_cv_lst'] = ['200047', '200050', '200054', '200071'],
                        Q['skin_map'] = {},
                        Q['main_character_id'] = 0,
                        Q['send_gift_count'] = 0,
                        Q['send_gift_limit'] = 0,
                        Q['commonViewList'] = [],
                        Q['using_commonview_index'] = 0,
                        Q['finished_endings_map'] = {},
                        Q['rewarded_endings_map'] = {},
                        Q['star_chars'] = [],
                        Q['hidden_characters_map'] = {},
                        Q.Inst = null,
                        Q;
                }
                    (f['UIBase']);
            f['UI_Sushe'] = N;
        }
            (uiscript || (uiscript = {}));













        // 屏蔽改变宿舍角色的网络请求
        !function (f) {
            var H = function () {
                function H(H) {
                    var Q = this;
                    this['scrollview'] = null,
                        this['select_index'] = 0,
                        this['show_index_list'] = [],
                        this['only_show_star_char'] = !1,
                        this.me = H,
                        this.me['getChildByName']('btn_visit')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            N.Inst['locking'] || N.Inst['close'](Laya['Handler']['create'](Q, function () {
                                f['UI_Sushe'].Inst['show_page_visit']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_look')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            N.Inst['locking'] || N.Inst['close'](Laya['Handler']['create'](Q, function () {
                                f['UI_Sushe'].Inst['to_look_illust']();
                            }));
                        }, null, !1),
                        this.me['getChildByName']('btn_huanzhuang')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            N.Inst['locking'] || f['UI_Sushe'].Inst['jump_to_char_skin']();
                        }, null, !1),
                        this.me['getChildByName']('btn_star')['clickHandler'] = Laya['Handler']['create'](this, function () {
                            N.Inst['locking'] || Q['onChangeStarShowBtnClick']();
                        }, null, !1),
                        this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                        this['scrollview']['setElastic'](),
                        this['dongtai_kaiguan'] = new f['UI_Dongtai_Kaiguan'](this.me['getChildByName']('dongtai'), new Laya['Handler'](this, function () {
                            f['UI_Sushe'].Inst['illust']['resetSkin']();
                        }));
                }
                return H['prototype'].show = function (H, N) {
                    if (void 0 === N && (N = !1), this.me['visible'] = !0, H ? this.me['alpha'] = 1 : f['UIBase']['anim_alpha_in'](this.me, {
                        x: 0
                    }, 200, 0), this['getShowStarState'](), this['sortShowCharsList'](), N || (this.me['getChildByName']('btn_star')['getChildAt'](1).x = this['only_show_star_char'] ? 107 : 47), this['scrollview']['reset'](), this['scrollview']['addItem'](this['show_index_list']['length']), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                        var Q = (Math['floor'](this['select_index'] / 3) - 1) / (Math.ceil(this['show_index_list']['length'] / 3) - 2.5);
                        this['scrollview'].rate = Math.min(1, Math.max(0, Q));
                    }
                },
                    H['prototype']['render_character_cell'] = function (H) {
                        var N = this,
                            Q = H['index'],
                            D = H['container'],
                            K = H['cache_data'];
                        D['visible'] = !0,
                            K['index'] = Q,
                            K['inited'] || (K['inited'] = !0, D['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                N['onClickAtHead'](K['index']);
                            }), K.skin = new f['UI_Character_Skin'](D['getChildByName']('btn')['getChildByName']('head')), K.bg = D['getChildByName']('btn')['getChildByName']('bg'), K['bound'] = D['getChildByName']('btn')['getChildByName']('bound'), K['btn_star'] = D['getChildByName']('btn_star'), K.star = D['getChildByName']('btn')['getChildByName']('star'), K['btn_star']['clickHandler'] = new Laya['Handler'](this, function () {
                                N['onClickAtStar'](K['index']);
                            }));
                        var b = D['getChildByName']('btn');
                        b['getChildByName']('choose')['visible'] = Q == this['select_index'];
                        var I = this['getCharInfoByIndex'](Q);
                        b['getChildByName']('redpoint')['visible'] = f['UI_Sushe']['check_char_redpoint'](I),
                            K.skin['setSkin'](I.skin, 'bighead'),
                            b['getChildByName']('using')['visible'] = I['charid'] == f['UI_Sushe']['main_character_id'],
                            D['getChildByName']('btn')['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (I['is_upgraded'] ? '2.png' : '.png'));
                        var q = cfg['item_definition']['character'].get(I['charid']);
                        'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? K['bound'].skin = q.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (I['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (I['is_upgraded'] ? '2.png' : '.png')) : q.ur ? (K['bound'].pos(-10, -2), K['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (I['is_upgraded'] ? '6.png' : '5.png'))) : (K['bound'].pos(4, 20), K['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (I['is_upgraded'] ? '4.png' : '3.png'))),
                            K['btn_star']['visible'] = this['select_index'] == Q,
                            K.star['visible'] = f['UI_Sushe']['is_char_star'](I['charid']) || this['select_index'] == Q;
                        var a = cfg['item_definition']['character'].find(I['charid']),
                            J = b['getChildByName']('label_name'),
                            k = a['name_' + GameMgr['client_language'] + '2'] ? a['name_' + GameMgr['client_language'] + '2'] : a['name_' + GameMgr['client_language']];
                        if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                            K.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (f['UI_Sushe']['is_char_star'](I['charid']) ? 'l' : 'd') + (I['is_upgraded'] ? '1.png' : '.png')),
                                J.text = k['replace']('-', '|')['replace'](/\./g, '·');
                            var r = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                            J['leading'] = r.test(k) ? -15 : 0;
                        } else
                            K.star.skin = game['Tools']['localUISrc']('myres/sushe/tag_star_' + (f['UI_Sushe']['is_char_star'](I['charid']) ? 'l.png' : 'd.png')), J.text = k;
                        ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) && ('200041' == I['charid'] ? (J['scaleX'] = 0.67, J['scaleY'] = 0.57) : (J['scaleX'] = 0.7, J['scaleY'] = 0.6));
                    },
                    H['prototype']['onClickAtHead'] = function (H) {
                        if (this['select_index'] == H) {
                            var N = this['getCharInfoByIndex'](H);
                            if (N['charid'] != f['UI_Sushe']['main_character_id'])
                                if (f['UI_PiPeiYuYue'].Inst['enable'])
                                    f['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2769));
                                else {
                                    var Q = f['UI_Sushe']['main_character_id'];
                                    f['UI_Sushe']['main_character_id'] = N['charid'],
                                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                        //    character_id: f['UI_Sushe']['main_character_id']
                                        //}, function () {}),
                                        GameMgr.Inst['account_data']['avatar_id'] = N.skin,
                                        f['UI_Sushe']['onMainSkinChange']();
                                    // 保存人物和皮肤
                                    MMP.settings.character = N.charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = N.skin;
                                    MMP.saveSettings();
                                    // END
                                    for (var D = 0; D < this['show_index_list']['length']; D++)
                                        this['getCharInfoByIndex'](D)['charid'] == Q && this['scrollview']['wantToRefreshItem'](D);
                                    this['scrollview']['wantToRefreshItem'](H);
                                }
                        } else {
                            var K = this['select_index'];
                            this['select_index'] = H,
                                K >= 0 && this['scrollview']['wantToRefreshItem'](K),
                                this['scrollview']['wantToRefreshItem'](H),
                                f['UI_Sushe'].Inst['change_select'](this['show_index_list'][H]);
                        }
                    },
                    H['prototype']['onClickAtStar'] = function (H) {
                        if (f['UI_Sushe']['change_char_star'](this['getCharInfoByIndex'](H)['charid']), this['only_show_star_char'])
                            this['scrollview']['wantToRefreshItem'](H);
                        else if (this.show(!0), Math['floor'](this['show_index_list']['length'] / 3) - 3 > 0) {
                            var N = (Math['floor'](this['select_index'] / 3) - 1) / (Math['floor'](this['show_index_list']['length'] / 3) - 3);
                            this['scrollview'].rate = Math.min(1, Math.max(0, N));
                        }
                        // 保存人物和皮肤
                        MMP.settings.star_chars = uiscript.UI_Sushe.star_chars;
                        MMP.saveSettings();
                        // END
                    },
                    H['prototype']['close'] = function (H) {
                        var N = this;
                        this.me['visible'] && (H ? this.me['visible'] = !1 : f['UIBase']['anim_alpha_out'](this.me, {
                            x: 0
                        }, 200, 0, Laya['Handler']['create'](this, function () {
                            N.me['visible'] = !1;
                        })));
                    },
                    H['prototype']['onChangeStarShowBtnClick'] = function () {
                        if (!this['only_show_star_char']) {
                            for (var H = !1, N = 0, Q = f['UI_Sushe']['star_chars']; N < Q['length']; N++) {
                                var D = Q[N];
                                if (!f['UI_Sushe']['hidden_characters_map'][D]) {
                                    H = !0;
                                    break;
                                }
                            }
                            if (!H)
                                return f['UI_SecondConfirm'].Inst['show_only_confirm'](game['Tools']['strOfLocalization'](3301)), void 0;
                        }
                        f['UI_Sushe'].Inst['change_select'](this['show_index_list']['length'] > 0 ? this['show_index_list'][0] : 0),
                            this['only_show_star_char'] = !this['only_show_star_char'],
                            app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], this['only_show_star_char'] ? 1 : 0);
                        var K = this.me['getChildByName']('btn_star')['getChildAt'](1);
                        Laya['Tween']['clearAll'](K),
                            Laya['Tween'].to(K, {
                                x: this['only_show_star_char'] ? 107 : 47
                            }, 150),
                            this.show(!0, !0);
                    },
                    H['prototype']['getShowStarState'] = function () {
                        if (0 == f['UI_Sushe']['star_chars']['length'])
                            return this['only_show_star_char'] = !1, void 0;
                        if (this['only_show_star_char'] = 1 == app['PlayerBehaviorStatistic']['get_val'](app['EBehaviorType']['Chara_Show_Star']), this['only_show_star_char']) {
                            for (var H = 0, N = f['UI_Sushe']['star_chars']; H < N['length']; H++) {
                                var Q = N[H];
                                if (!f['UI_Sushe']['hidden_characters_map'][Q])
                                    return;
                            }
                            this['only_show_star_char'] = !1,
                                app['PlayerBehaviorStatistic']['update_val'](app['EBehaviorType']['Chara_Show_Star'], 0);
                        }
                    },
                    H['prototype']['sortShowCharsList'] = function () {
                        this['show_index_list'] = [],
                            this['select_index'] = -1;
                        for (var H = 0, N = f['UI_Sushe']['star_chars']; H < N['length']; H++) {
                            var Q = N[H];
                            if (!f['UI_Sushe']['hidden_characters_map'][Q])
                                for (var D = 0; D < f['UI_Sushe']['characters']['length']; D++)
                                    if (f['UI_Sushe']['characters'][D]['charid'] == Q) {
                                        D == f['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']),
                                            this['show_index_list'].push(D);
                                        break;
                                    }
                        }
                        if (!this['only_show_star_char'])
                            for (var D = 0; D < f['UI_Sushe']['characters']['length']; D++)
                                f['UI_Sushe']['hidden_characters_map'][f['UI_Sushe']['characters'][D]['charid']] || -1 == this['show_index_list']['indexOf'](D) && (D == f['UI_Sushe'].Inst['select_index'] && (this['select_index'] = this['show_index_list']['length']), this['show_index_list'].push(D));
                    },
                    H['prototype']['getCharInfoByIndex'] = function (H) {
                        return f['UI_Sushe']['characters'][this['show_index_list'][H]];
                    },
                    H;
            }
                (),
                N = function (N) {
                    function Q() {
                        var f = N.call(this, 'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? new ui['lobby']['sushe_selectUI']() : new ui['lobby']['sushe_select_enUI']()) || this;
                        return f['bg_width_head'] = 962,
                            f['bg_width_zhuangban'] = 1819,
                            f['bg2_delta'] = -29,
                            f['container_top'] = null,
                            f['locking'] = !1,
                            f.tabs = [],
                            f['tab_index'] = 0,
                            Q.Inst = f,
                            f;
                    }
                    return __extends(Q, N),
                        Q['prototype']['onCreate'] = function () {
                            var N = this;
                            this['container_top'] = this.me['getChildByName']('top'),
                                this['container_top']['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    N['locking'] || (1 == N['tab_index'] && N['container_zhuangban']['changed'] ? f['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](N, function () {
                                        N['close'](),
                                            f['UI_Sushe'].Inst['go2Lobby']();
                                    }), null) : (N['close'](), f['UI_Sushe'].Inst['go2Lobby']()));
                                }, null, !1),
                                this.root = this.me['getChildByName']('root'),
                                this.bg2 = this.root['getChildByName']('bg2'),
                                this.bg = this.root['getChildByName']('bg');
                            for (var Q = this.root['getChildByName']('container_tabs'), D = function (H) {
                                K.tabs.push(Q['getChildAt'](H)),
                                    K.tabs[H]['clickHandler'] = new Laya['Handler'](K, function () {
                                        N['locking'] || N['tab_index'] != H && (1 == N['tab_index'] && N['container_zhuangban']['changed'] ? f['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](N, function () {
                                            N['change_tab'](H);
                                        }), null) : N['change_tab'](H));
                                    });
                            }, K = this, b = 0; b < Q['numChildren']; b++)
                                D(b);
                            this['container_head'] = new H(this.root['getChildByName']('container_heads')),
                                this['container_zhuangban'] = new f['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                    return N['locking'];
                                }));
                        },
                        Q['prototype'].show = function (H) {
                            var N = this;
                            this['enable'] = !0,
                                this['locking'] = !0,
                                this['container_head']['dongtai_kaiguan']['refresh'](),
                                this['tab_index'] = H,
                                this['container_top'].y = 48,
                                0 == this['tab_index'] ? (this.bg['width'] = this['bg_width_head'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban']['close'](!0), this['container_head'].show(!0), f['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), f['UIBase']['anim_alpha_in'](this.root, {
                                    x: 30
                                }, 200)) : (this.bg['width'] = this['bg_width_zhuangban'], this.bg2['width'] = this.bg['width'] + this['bg2_delta'], this['container_zhuangban'].show(!0), this['container_head']['close'](!0), f['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200), f['UIBase']['anim_alpha_in'](this.root, {
                                    y: 30
                                }, 200)),
                                Laya['timer'].once(200, this, function () {
                                    N['locking'] = !1;
                                });
                            for (var Q = 0; Q < this.tabs['length']; Q++) {
                                var D = this.tabs[Q];
                                D.skin = game['Tools']['localUISrc'](Q == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var K = D['getChildByName']('word');
                                K['color'] = Q == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                    K['scaleX'] = K['scaleY'] = Q == this['tab_index'] ? 1.1 : 1,
                                    Q == this['tab_index'] && D['parent']['setChildIndex'](D, this.tabs['length'] - 1);
                            }
                        },
                        Q['prototype']['change_tab'] = function (H) {
                            var N = this;
                            this['tab_index'] = H;
                            for (var Q = 0; Q < this.tabs['length']; Q++) {
                                var D = this.tabs[Q];
                                D.skin = game['Tools']['localUISrc'](Q == H ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var K = D['getChildByName']('word');
                                K['color'] = Q == H ? '#552c1c' : '#d3a86c',
                                    K['scaleX'] = K['scaleY'] = Q == H ? 1.1 : 1,
                                    Q == H && D['parent']['setChildIndex'](D, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['container_zhuangban']['close'](!1), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_head']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    f['UI_Sushe'].Inst['open_illust'](),
                                        N['container_head'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_head'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])) : 1 == this['tab_index'] && (this['container_head']['close'](!1), f['UI_Sushe'].Inst['hide_illust'](), Laya['Tween'].to(this.bg, {
                                    width: this['bg_width_zhuangban']
                                }, 200, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    N['container_zhuangban'].show(!1);
                                })), Laya['Tween'].to(this.bg2, {
                                    width: this['bg_width_zhuangban'] + this['bg2_delta']
                                }, 200, Laya.Ease['strongOut'])),
                                Laya['timer'].once(400, this, function () {
                                    N['locking'] = !1;
                                });
                        },
                        Q['prototype']['close'] = function (H) {
                            var N = this;
                            this['locking'] = !0,
                                f['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150),
                                0 == this['tab_index'] ? f['UIBase']['anim_alpha_out'](this.root, {
                                    x: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    N['container_head']['close'](!0);
                                })) : f['UIBase']['anim_alpha_out'](this.root, {
                                    y: 30
                                }, 150, 0, Laya['Handler']['create'](this, function () {
                                    N['container_zhuangban']['close'](!0);
                                })),
                                Laya['timer'].once(150, this, function () {
                                    N['locking'] = !1,
                                        N['enable'] = !1,
                                        H && H.run();
                                });
                        },
                        Q['prototype']['onDisable'] = function () {
                            for (var H = 0; H < f['UI_Sushe']['characters']['length']; H++) {
                                var N = f['UI_Sushe']['characters'][H].skin,
                                    Q = cfg['item_definition'].skin.get(N);
                                Q && Laya['loader']['clearTextureRes'](game['LoadMgr']['getResImageSkin'](Q.path + '/bighead.png'));
                            }
                        },
                        Q['prototype']['changeKaiguanShow'] = function (f) {
                            f ? this['container_head']['dongtai_kaiguan'].show() : this['container_head']['dongtai_kaiguan'].hide();
                        },
                        Q['prototype']['changeZhuangbanSlot'] = function (f) {
                            this['container_zhuangban']['changeSlotByItemId'](f);
                        },
                        Q;
                }
                    (f['UIBase']);
            f['UI_Sushe_Select'] = N;
        }
            (uiscript || (uiscript = {}));










        // 友人房
        !function (f) {
            var H = function () {
                function H(f) {
                    var H = this;
                    this['friends'] = [],
                        this['sortlist'] = [],
                        this.me = f,
                        this.me['visible'] = !1,
                        this['blackbg'] = f['getChildByName']('blackbg'),
                        this['blackbg']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            H['locking'] || H['close']();
                        }, null, !1),
                        this.root = f['getChildByName']('root'),
                        this['scrollview'] = this.root['scriptMap']['capsui.CScrollView'],
                        this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, this['render_item'], null, !1)),
                        this['noinfo'] = this.root['getChildByName']('noinfo');
                }
                return H['prototype'].show = function () {
                    var H = this;
                    this['locking'] = !0,
                        this.me['visible'] = !0,
                        this['scrollview']['reset'](),
                        this['friends'] = [],
                        this['sortlist'] = [];
                    for (var N = game['FriendMgr']['friend_list'], Q = 0; Q < N['length']; Q++)
                        this['sortlist'].push(Q);
                    this['sortlist'] = this['sortlist'].sort(function (f, H) {
                        var Q = N[f],
                            D = 0;
                        if (Q['state']['is_online']) {
                            var K = game['Tools']['playState2Desc'](Q['state']['playing']);
                            D += '' != K ? 30000000000 : 60000000000,
                                Q.base['level'] && (D += Q.base['level'].id % 1000 * 10000000),
                                Q.base['level3'] && (D += Q.base['level3'].id % 1000 * 10000),
                                D += -Math['floor'](Q['state']['login_time'] / 10000000);
                        } else
                            D += Q['state']['logout_time'];
                        var b = N[H],
                            I = 0;
                        if (b['state']['is_online']) {
                            var K = game['Tools']['playState2Desc'](b['state']['playing']);
                            I += '' != K ? 30000000000 : 60000000000,
                                b.base['level'] && (I += b.base['level'].id % 1000 * 10000000),
                                b.base['level3'] && (I += b.base['level3'].id % 1000 * 10000),
                                I += -Math['floor'](b['state']['login_time'] / 10000000);
                        } else
                            I += b['state']['logout_time'];
                        return I - D;
                    });
                    for (var Q = 0; Q < N['length']; Q++)
                        this['friends'].push({
                            f: N[Q],
                            invited: !1
                        });
                    this['noinfo']['visible'] = 0 == this['friends']['length'],
                        this['scrollview']['addItem'](this['friends']['length']),
                        f['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                            H['locking'] = !1;
                        }));
                },
                    H['prototype']['close'] = function () {
                        var H = this;
                        this['locking'] = !0,
                            f['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                H['locking'] = !1,
                                    H.me['visible'] = !1;
                            }));
                    },
                    H['prototype']['render_item'] = function (H) {
                        var N = H['index'],
                            Q = H['container'],
                            K = H['cache_data'];
                        K.head || (K.head = new f['UI_Head'](Q['getChildByName']('head'), 'UI_WaitingRoom'), K.name = Q['getChildByName']('name'), K['state'] = Q['getChildByName']('label_state'), K.btn = Q['getChildByName']('btn_invite'), K['invited'] = Q['getChildByName']('invited'));
                        var b = this['friends'][this['sortlist'][N]];
                        K.head.id = game['GameUtility']['get_limited_skin_id'](b.f.base['avatar_id']),
                            K.head['set_head_frame'](b.f.base['account_id'], b.f.base['avatar_frame']),
                            game['Tools']['SetNickname'](K.name, b.f.base, GameMgr.Inst['hide_nickname']);
                        var I = !1;
                        if (b.f['state']['is_online']) {
                            var q = game['Tools']['playState2Desc'](b.f['state']['playing']);
                            '' != q ? (K['state'].text = game['Tools']['strOfLocalization'](2069, [q]), K['state']['color'] = '#a9d94d', K.name['getChildByName']('name')['color'] = '#a9d94d') : (K['state'].text = game['Tools']['strOfLocalization'](2071), K['state']['color'] = '#58c4db', K.name['getChildByName']('name')['color'] = '#58c4db', I = !0);
                        } else
                            K['state'].text = game['Tools']['strOfLocalization'](2072), K['state']['color'] = '#8c8c8c', K.name['getChildByName']('name')['color'] = '#8c8c8c';
                        b['invited'] ? (K.btn['visible'] = !1, K['invited']['visible'] = !0) : (K.btn['visible'] = !0, K['invited']['visible'] = !1, game['Tools']['setGrayDisable'](K.btn, !I), I && (K.btn['clickHandler'] = Laya['Handler']['create'](this, function () {
                            game['Tools']['setGrayDisable'](K.btn, !0);
                            var H = {
                                room_id: D.Inst['room_id'],
                                mode: D.Inst['room_mode'],
                                nickname: GameMgr.Inst['account_data']['nickname'],
                                verified: GameMgr.Inst['account_data']['verified'],
                                account_id: GameMgr.Inst['account_id']
                            };
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'sendClientMessage', {
                                target_id: b.f.base['account_id'],
                                type: game['EFriendMsgType']['room_invite'],
                                content: JSON['stringify'](H)
                            }, function (H, N) {
                                H || N['error'] ? (game['Tools']['setGrayDisable'](K.btn, !1), f['UIMgr'].Inst['showNetReqError']('sendClientMessage', H, N)) : (K.btn['visible'] = !1, K['invited']['visible'] = !0, b['invited'] = !0);
                            });
                        }, null, !1)));
                    },
                    H;
            }
                (),
                N = function () {
                    function H(H) {
                        var N = this;
                        this.tabs = [],
                            this['tab_index'] = 0,
                            this.me = H,
                            this['blackmask'] = this.me['getChildByName']('blackmask'),
                            this.root = this.me['getChildByName']('root'),
                            this['page_head'] = new f['zhuangban']['Page_Waiting_Head'](this.root['getChildByName']('container_heads')),
                            this['page_zhangban'] = new f['zhuangban']['Container_Zhuangban'](this.root['getChildByName']('container_zhuangban0'), this.root['getChildByName']('container_zhuangban1'), new Laya['Handler'](this, function () {
                                return N['locking'];
                            }));
                        for (var Q = this.root['getChildByName']('container_tabs'), D = function (H) {
                            K.tabs.push(Q['getChildAt'](H)),
                                K.tabs[H]['clickHandler'] = new Laya['Handler'](K, function () {
                                    N['locking'] || N['tab_index'] != H && (1 == N['tab_index'] && N['page_zhangban']['changed'] ? f['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](N, function () {
                                        N['change_tab'](H);
                                    }), null) : N['change_tab'](H));
                                });
                        }, K = this, b = 0; b < Q['numChildren']; b++)
                            D(b);
                        this.root['getChildByName']('close')['clickHandler'] = new Laya['Handler'](this, function () {
                            N['locking'] || (1 == N['tab_index'] && N['page_zhangban']['changed'] ? f['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](N, function () {
                                N['close'](!1);
                            }), null) : N['close'](!1));
                        }),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                N['locking'] || (1 == N['tab_index'] && N['page_zhangban']['changed'] ? f['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](N, function () {
                                    N['close'](!1);
                                }), null) : N['close'](!1));
                            });
                    }
                    return H['prototype'].show = function () {
                        var H = this;
                        this.me['visible'] = !0,
                            this['blackmask']['alpha'] = 0,
                            this['locking'] = !0,
                            Laya['Tween'].to(this['blackmask'], {
                                alpha: 0.3
                            }, 150),
                            f['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                H['locking'] = !1;
                            })),
                            this['tab_index'] = 0,
                            this['page_zhangban']['close'](!0),
                            this['page_head'].show(!0);
                        for (var N = 0; N < this.tabs['length']; N++) {
                            var Q = this.tabs[N];
                            Q.skin = game['Tools']['localUISrc'](N == this['tab_index'] ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                            var D = Q['getChildByName']('word');
                            D['color'] = N == this['tab_index'] ? '#552c1c' : '#d3a86c',
                                D['scaleX'] = D['scaleY'] = N == this['tab_index'] ? 1.1 : 1,
                                N == this['tab_index'] && Q['parent']['setChildIndex'](Q, this.tabs['length'] - 1);
                        }
                    },
                        H['prototype']['change_tab'] = function (f) {
                            var H = this;
                            this['tab_index'] = f;
                            for (var N = 0; N < this.tabs['length']; N++) {
                                var Q = this.tabs[N];
                                Q.skin = game['Tools']['localUISrc'](N == f ? 'myres/sushe/btn_shine2.png' : 'myres/sushe/btn_dark2.png');
                                var D = Q['getChildByName']('word');
                                D['color'] = N == f ? '#552c1c' : '#d3a86c',
                                    D['scaleX'] = D['scaleY'] = N == f ? 1.1 : 1,
                                    N == f && Q['parent']['setChildIndex'](Q, this.tabs['length'] - 1);
                            }
                            this['locking'] = !0,
                                0 == this['tab_index'] ? (this['page_zhangban']['close'](!1), Laya['timer'].once(100, this, function () {
                                    H['page_head'].show(!1);
                                })) : 1 == this['tab_index'] && (this['page_head']['close'](!1), Laya['timer'].once(100, this, function () {
                                    H['page_zhangban'].show(!1);
                                })),
                                Laya['timer'].once(400, this, function () {
                                    H['locking'] = !1;
                                });
                        },
                        H['prototype']['close'] = function (H) {
                            var N = this;
                            //修改友人房间立绘
                            if (!(N.page_head.choosed_chara_index == 0 && N.page_head.choosed_skin_id == 0)) {
                                for (let id = 0; id < uiscript.UI_WaitingRoom.Inst.players.length; id++) {
                                    if (uiscript.UI_WaitingRoom.Inst.players[id].account_id == GameMgr.Inst.account_id) {
                                        uiscript.UI_WaitingRoom.Inst.players[id].avatar_id = N.page_head.choosed_skin_id;
                                        GameMgr.Inst.account_data.avatar_id = N.page_head.choosed_skin_id;
                                        uiscript.UI_Sushe.main_character_id = N.page_head.choosed_chara_index + 200001;
                                        uiscript.UI_WaitingRoom.Inst._refreshPlayerInfo(uiscript.UI_WaitingRoom.Inst.players[id]);
                                        MMP.settings.characters[N.page_head.choosed_chara_index] = N.page_head.choosed_skin_id;
                                        MMP.saveSettings();
                                        break;
                                    }
                                }
                            }
                            //end
                            this.me['visible'] && (H ? (this['page_head']['close'](!0), this['page_zhangban']['close'](!0), this.me['visible'] = !1) : (app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: D.Inst['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                dressing: !1
                            }, function () { }), this['locking'] = !0, this['page_head']['close'](!1), this['page_zhangban']['close'](!1), f['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                N['locking'] = !1,
                                    N.me['visible'] = !1;
                            }))));
                        },
                        H;
                }
                    (),
                Q = function () {
                    function f(f) {
                        this['modes'] = [],
                            this.me = f,
                            this.bg = this.me['getChildByName']('bg'),
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']));
                    }
                    return f['prototype'].show = function (f) {
                        this.me['visible'] = !0,
                            this['scrollview']['reset'](),
                            this['modes'] = f,
                            this['scrollview']['addItem'](f['length']);
                        var H = this['scrollview']['total_height'];
                        H > 380 ? (this['scrollview']['_content'].y = 10, this.bg['height'] = 400) : (this['scrollview']['_content'].y = 390 - H, this.bg['height'] = H + 20),
                            this.bg['visible'] = !0;
                    },
                        f['prototype']['render_item'] = function (f) {
                            var H = f['index'],
                                N = f['container'],
                                Q = N['getChildByName']('info');
                            Q['fontSize'] = 40,
                                Q['fontSize'] = this['modes'][H]['length'] <= 5 ? 40 : this['modes'][H]['length'] <= 9 ? 55 - 3 * this['modes'][H]['length'] : 28,
                                Q.text = this['modes'][H];
                        },
                        f;
                }
                    (),
                D = function (D) {
                    function K() {
                        var H = D.call(this, new ui['lobby']['waitingroomUI']()) || this;
                        return H['skin_ready'] = 'myres/room/btn_ready.png',
                            H['skin_cancel'] = 'myres/room/btn_cancel.png',
                            H['skin_start'] = 'myres/room/btn_start.png',
                            H['skin_start_no'] = 'myres/room/btn_start_no.png',
                            H['update_seq'] = 0,
                            H['pre_msgs'] = [],
                            H['msg_tail'] = -1,
                            H['posted'] = !1,
                            H['label_rommid'] = null,
                            H['player_cells'] = [],
                            H['btn_ok'] = null,
                            H['btn_invite_friend'] = null,
                            H['btn_add_robot'] = null,
                            H['btn_dress'] = null,
                            H['btn_copy'] = null,
                            H['beReady'] = !1,
                            H['room_id'] = -1,
                            H['owner_id'] = -1,
                            H['tournament_id'] = 0,
                            H['max_player_count'] = 0,
                            H['players'] = [],
                            H['container_rules'] = null,
                            H['container_top'] = null,
                            H['container_right'] = null,
                            H['locking'] = !1,
                            H['mousein_copy'] = !1,
                            H['popout'] = null,
                            H['room_link'] = null,
                            H['btn_copy_link'] = null,
                            H['last_start_room'] = 0,
                            H['invitefriend'] = null,
                            H['pre_choose'] = null,
                            H['ai_name'] = game['Tools']['strOfLocalization'](2003),
                            K.Inst = H,
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerReady', Laya['Handler']['create'](H, function (f) {
                                app.Log.log('NotifyRoomPlayerReady:' + JSON['stringify'](f)),
                                    H['onReadyChange'](f['account_id'], f['ready'], f['dressing']);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomPlayerUpdate', Laya['Handler']['create'](H, function (f) {
                                app.Log.log('NotifyRoomPlayerUpdate:' + JSON['stringify'](f)),
                                    H['onPlayerChange'](f);
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomGameStart', Laya['Handler']['create'](H, function (f) {
                                H['enable'] && (app.Log.log('NotifyRoomGameStart:' + JSON['stringify'](f)), GameMgr.Inst['onPipeiYuyueSuccess'](0, 'youren'), H['onGameStart'](f));
                            })),
                            app['NetAgent']['AddListener2Lobby']('NotifyRoomKickOut', Laya['Handler']['create'](H, function (f) {
                                app.Log.log('NotifyRoomKickOut:' + JSON['stringify'](f)),
                                    H['onBeKictOut']();
                            })),
                            game['LobbyNetMgr'].Inst['add_connect_listener'](Laya['Handler']['create'](H, function () {
                                H['enable'] && H.hide(Laya['Handler']['create'](H, function () {
                                    f['UI_Lobby'].Inst['enable'] = !0;
                                }));
                            }, null, !1)),
                            H;
                    }
                    return __extends(K, D),
                        K['prototype']['push_msg'] = function (f) {
                            this['pre_msgs']['length'] < 15 ? this['pre_msgs'].push(JSON['parse'](f)) : (this['msg_tail'] = (this['msg_tail'] + 1) % this['pre_msgs']['length'], this['pre_msgs'][this['msg_tail']] = JSON['parse'](f));
                        },
                        Object['defineProperty'](K['prototype'], 'inRoom', {
                            get: function () {
                                return -1 != this['room_id'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        Object['defineProperty'](K['prototype'], 'robot_count', {
                            get: function () {
                                for (var f = 0, H = 0; H < this['players']['length']; H++)
                                    2 == this['players'][H]['category'] && f++;
                                return f;
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        K['prototype']['resetData'] = function () {
                            this['room_id'] = -1,
                                this['owner_id'] = -1,
                                this['room_mode'] = {},
                                this['max_player_count'] = 0,
                                this['players'] = [];
                        },
                        K['prototype']['updateData'] = function (f) {
                            if (!f)
                                return this['resetData'](), void 0;
                            //修改友人房间立绘
                            for (let i = 0; i < f.persons.length; i++) {

                                if (f.persons[i].account_id == GameMgr.Inst.account_data.account_id) {
                                    f.persons[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                    f.persons[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                    f.persons[i].character = uiscript.UI_Sushe.main_chara_info;
                                    f.persons[i].title = GameMgr.Inst.account_data.title;
                                    f.persons[i].views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                    if (MMP.settings.nickname != '') {
                                        f.persons[i].nickname = MMP.settings.nickname;
                                    }
                                    break;
                                }
                            }
                            //end
                            this['room_id'] = f['room_id'],
                                this['owner_id'] = f['owner_id'],
                                this['room_mode'] = f.mode,
                                this['public_live'] = f['public_live'],
                                this['tournament_id'] = 0,
                                f['tournament_id'] && (this['tournament_id'] = f['tournament_id']),
                                this['ai_name'] = game['Tools']['strOfLocalization'](2003),
                                this['room_mode']['detail_rule'] && (1 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2003)), 2 === this['room_mode']['detail_rule']['ai_level'] && (this['ai_name'] = game['Tools']['strOfLocalization'](2004))),
                                this['max_player_count'] = f['max_player_count'],
                                this['players'] = [];
                            for (var H = 0; H < f['persons']['length']; H++) {
                                var N = f['persons'][H];
                                N['ready'] = !1,
                                    N['cell_index'] = -1,
                                    N['category'] = 1,
                                    this['players'].push(N);
                            }
                            for (var H = 0; H < f['robot_count']; H++)
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
                            for (var H = 0; H < f['ready_list']['length']; H++)
                                for (var Q = 0; Q < this['players']['length']; Q++)
                                    if (this['players'][Q]['account_id'] == f['ready_list'][H]) {
                                        this['players'][Q]['ready'] = !0;
                                        break;
                                    }
                            this['update_seq'] = 0,
                                f.seq && (this['update_seq'] = f.seq);
                        },
                        K['prototype']['onReadyChange'] = function (f, H, N) {
                            for (var Q = 0; Q < this['players']['length']; Q++)
                                if (this['players'][Q]['account_id'] == f) {
                                    this['players'][Q]['ready'] = H,
                                        this['players'][Q]['dressing'] = N,
                                        this['_onPlayerReadyChange'](this['players'][Q]);
                                    break;
                                }
                            this['refreshStart']();
                        },
                        K['prototype']['onPlayerChange'] = function (f) {
                            if (app.Log.log(f), f = f['toJSON'](), !(f.seq && f.seq <= this['update_seq'])) {
                                // 修改友人房间立绘
                                for (var i = 0; i < f.player_list.length; i++) {

                                    if (f.player_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                        f.player_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        f.player_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                        f.player_list[i].title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            f.player_list[i].nickname = MMP.settings.nickname;
                                        }
                                        break;
                                    }
                                }
                                if (f.update_list != undefined) {
                                    for (var i = 0; i < f.update_list.length; i++) {

                                        if (f.update_list[i].account_id == GameMgr.Inst.account_data.account_id) {
                                            f.update_list[i].avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                            f.update_list[i].avatar_id = GameMgr.Inst.account_data.avatar_id;
                                            f.update_list[i].title = GameMgr.Inst.account_data.title;
                                            if (MMP.settings.nickname != '') {
                                                f.update_list[i].nickname = MMP.settings.nickname;
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
                                this['update_seq'] = f.seq;
                                var H = {};
                                H.type = 'onPlayerChange0',
                                    H['players'] = this['players'],
                                    H.msg = f,
                                    this['push_msg'](JSON['stringify'](H));
                                var N = this['robot_count'],
                                    Q = f['robot_count'];
                                if (Q < this['robot_count']) {
                                    this['pre_choose'] && 2 == this['pre_choose']['category'] && (this['pre_choose']['category'] = 0, this['pre_choose'] = null, N--);
                                    for (var D = 0; D < this['players']['length']; D++)
                                        2 == this['players'][D]['category'] && N > Q && (this['players'][D]['category'] = 0, N--);
                                }
                                for (var K = [], b = f['player_list'], D = 0; D < this['players']['length']; D++)
                                    if (1 == this['players'][D]['category']) {
                                        for (var I = -1, q = 0; q < b['length']; q++)
                                            if (b[q]['account_id'] == this['players'][D]['account_id']) {
                                                I = q;
                                                break;
                                            }
                                        if (-1 != I) {
                                            var a = b[I];
                                            K.push(this['players'][D]),
                                                this['players'][D]['avatar_id'] = a['avatar_id'],
                                                this['players'][D]['title'] = a['title'],
                                                this['players'][D]['verified'] = a['verified'];
                                        }
                                    } else
                                        2 == this['players'][D]['category'] && K.push(this['players'][D]);
                                this['players'] = K;
                                for (var D = 0; D < b['length']; D++) {
                                    for (var J = !1, a = b[D], q = 0; q < this['players']['length']; q++)
                                        if (1 == this['players'][q]['category'] && this['players'][q]['account_id'] == a['account_id']) {
                                            J = !0;
                                            break;
                                        }
                                    J || this['players'].push({
                                        account_id: a['account_id'],
                                        avatar_id: a['avatar_id'],
                                        nickname: a['nickname'],
                                        verified: a['verified'],
                                        title: a['title'],
                                        level: a['level'],
                                        level3: a['level3'],
                                        ready: !1,
                                        dressing: !1,
                                        cell_index: -1,
                                        category: 1
                                    });
                                }
                                for (var k = [!1, !1, !1, !1], D = 0; D < this['players']['length']; D++)
                                    - 1 != this['players'][D]['cell_index'] && (k[this['players'][D]['cell_index']] = !0, this['_refreshPlayerInfo'](this['players'][D]));
                                for (var D = 0; D < this['players']['length']; D++)
                                    if (1 == this['players'][D]['category'] && -1 == this['players'][D]['cell_index'])
                                        for (var q = 0; q < this['max_player_count']; q++)
                                            if (!k[q]) {
                                                this['players'][D]['cell_index'] = q,
                                                    k[q] = !0,
                                                    this['_refreshPlayerInfo'](this['players'][D]);
                                                break;
                                            }
                                for (var N = this['robot_count'], Q = f['robot_count']; Q > N;) {
                                    for (var r = -1, q = 0; q < this['max_player_count']; q++)
                                        if (!k[q]) {
                                            r = q;
                                            break;
                                        }
                                    if (-1 == r)
                                        break;
                                    k[r] = !0,
                                        this['players'].push({
                                            category: 2,
                                            cell_index: r,
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
                                        N++;
                                }
                                for (var D = 0; D < this['max_player_count']; D++)
                                    k[D] || this['_clearCell'](D);
                                var H = {};
                                if (H.type = 'onPlayerChange1', H['players'] = this['players'], this['push_msg'](JSON['stringify'](H)), f['owner_id']) {
                                    if (this['owner_id'] = f['owner_id'], this['enable'])
                                        if (this['owner_id'] == GameMgr.Inst['account_id'])
                                            this['refreshAsOwner']();
                                        else
                                            for (var q = 0; q < this['players']['length']; q++)
                                                if (this['players'][q] && this['players'][q]['account_id'] == this['owner_id']) {
                                                    this['_refreshPlayerInfo'](this['players'][q]);
                                                    break;
                                                }
                                } else if (this['enable'])
                                    if (this['owner_id'] == GameMgr.Inst['account_id'])
                                        this['refreshAsOwner']();
                                    else
                                        for (var q = 0; q < this['players']['length']; q++)
                                            if (this['players'][q] && this['players'][q]['account_id'] == this['owner_id']) {
                                                this['_refreshPlayerInfo'](this['players'][q]);
                                                break;
                                            }
                            }
                        },
                        K['prototype']['onBeKictOut'] = function () {
                            this['resetData'](),
                                this['enable'] && (this['enable'] = !1, this['pop_change_view']['close'](!1), f['UI_Lobby'].Inst['enable'] = !0, f['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](52)));
                        },
                        K['prototype']['onCreate'] = function () {
                            var D = this;
                            this['last_start_room'] = 0;
                            var K = this.me['getChildByName']('root');
                            this['container_top'] = K['getChildByName']('top'),
                                this['container_right'] = K['getChildByName']('right'),
                                this['label_rommid'] = this['container_top']['getChildByName']('label_roomid');
                            for (var b = function (H) {
                                var N = K['getChildByName']('player_' + H['toString']()),
                                    Q = {};
                                Q['index'] = H,
                                    Q['container'] = N,
                                    Q['container_flag'] = N['getChildByName']('flag'),
                                    Q['container_flag']['visible'] = !1,
                                    Q['container_name'] = N['getChildByName']('container_name'),
                                    Q.name = N['getChildByName']('container_name')['getChildByName']('name'),
                                    Q['btn_t'] = N['getChildByName']('btn_t'),
                                    Q['container_illust'] = N['getChildByName']('container_illust'),
                                    Q['illust'] = new f['UI_Character_Skin'](N['getChildByName']('container_illust')['getChildByName']('illust')),
                                    Q.host = N['getChildByName']('host'),
                                    Q['title'] = new f['UI_PlayerTitle'](N['getChildByName']('container_name')['getChildByName']('title'), 'UI_WaitingRoom'),
                                    Q.rank = new f['UI_Level'](N['getChildByName']('container_name')['getChildByName']('rank'), 'UI_WaitingRoom'),
                                    Q['is_robot'] = !1;
                                var b = 0;
                                Q['btn_t']['clickHandler'] = Laya['Handler']['create'](I, function () {
                                    if (!(D['locking'] || Laya['timer']['currTimer'] < b)) {
                                        b = Laya['timer']['currTimer'] + 500;
                                        for (var f = 0; f < D['players']['length']; f++)
                                            if (D['players'][f]['cell_index'] == H) {
                                                D['kickPlayer'](f);
                                                break;
                                            }
                                    }
                                }, null, !1),
                                    Q['btn_info'] = N['getChildByName']('btn_info'),
                                    Q['btn_info']['clickHandler'] = Laya['Handler']['create'](I, function () {
                                        if (!D['locking'])
                                            for (var N = 0; N < D['players']['length']; N++)
                                                if (D['players'][N]['cell_index'] == H) {
                                                    D['players'][N]['account_id'] && D['players'][N]['account_id'] > 0 && f['UI_OtherPlayerInfo'].Inst.show(D['players'][N]['account_id'], D['room_mode'].mode < 10 ? 1 : 2, 1, 1, GameMgr.Inst['hide_nickname'] ? game['Tools']['strOfLocalization'](3060) : '');
                                                    break;
                                                }
                                    }, null, !1),
                                    I['player_cells'].push(Q);
                            }, I = this, q = 0; 4 > q; q++)
                                b(q);
                            this['btn_ok'] = K['getChildByName']('btn_ok');
                            var a = 0;
                            this['btn_ok']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < a + 500 || (a = Laya['timer']['currTimer'], D['owner_id'] == GameMgr.Inst['account_id'] ? D['getStart']() : D['switchReady']());
                            }, null, !1);
                            var J = 0;
                            this['container_top']['getChildByName']('btn_leave')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                Laya['timer']['currTimer'] < J + 500 || (J = Laya['timer']['currTimer'], D['leaveRoom']());
                            }, null, !1),
                                this['btn_invite_friend'] = this['container_right']['getChildByName']('btn_friend'),
                                this['btn_invite_friend']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    D['locking'] || D['invitefriend'].show();
                                }, null, !1),
                                this['btn_add_robot'] = this['container_right']['getChildByName']('btn_robot');
                            var k = 0;
                            this['btn_add_robot']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                D['locking'] || Laya['timer']['currTimer'] < k || (k = Laya['timer']['currTimer'] + 1000, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: D['robot_count'] + 1
                                }, function (H, N) {
                                    (H || N['error'] && 1111 != N['error'].code) && f['UIMgr'].Inst['showNetReqError']('modifyRoom_add', H, N),
                                        k = 0;
                                }));
                            }, null, !1),
                                this['container_right']['getChildByName']('btn_help')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (!D['locking']) {
                                        var H = 0;
                                        D['room_mode']['detail_rule'] && D['room_mode']['detail_rule']['chuanma'] && (H = 1),
                                            f['UI_Rules'].Inst.show(0, null, H);
                                    }
                                }, null, !1),
                                this['btn_dress'] = this['container_right']['getChildByName']('btn_view'),
                                this['btn_dress']['clickHandler'] = new Laya['Handler'](this, function () {
                                    D['locking'] || D['beReady'] && D['owner_id'] != GameMgr.Inst['account_id'] || (D['pop_change_view'].show(), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                        ready: D['owner_id'] == GameMgr.Inst['account_id'] ? !0 : !1,
                                        dressing: !0
                                    }, function () { }));
                                }),
                                this['btn_copy'] = this['container_right']['getChildByName']('btn_copy'),
                                this['btn_copy'].on('mouseover', this, function () {
                                    D['mousein_copy'] = !0;
                                }),
                                this['btn_copy'].on('mouseout', this, function () {
                                    D['mousein_copy'] = !1;
                                }),
                                this['btn_copy']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    D['popout']['visible'] || (GameMgr.Inst['BehavioralStatistics'](12), D['popout']['visible'] = !0, f['UIBase']['anim_pop_out'](D['popout'], null));
                                }, null, !1),
                                this['container_rules'] = new Q(this['container_right']['getChildByName']('container_rules')),
                                this['popout'] = this.me['getChildByName']('pop'),
                                this['room_link'] = this['popout']['getChildByName']('input')['getChildByName']('txtinput'),
                                this['room_link']['editable'] = !1,
                                this['btn_copy_link'] = this['popout']['getChildByName']('btn_copy'),
                                this['btn_copy_link']['visible'] = !1,
                                GameMgr['inConch'] ? (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    var H = Laya['PlatformClass']['createClass']('layaair.majsoul.mjmgr');
                                    H.call('setSysClipboardText', D['room_link'].text),
                                        f['UIBase']['anim_pop_hide'](D['popout'], Laya['Handler']['create'](D, function () {
                                            D['popout']['visible'] = !1;
                                        })),
                                        f['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)) : GameMgr['iniOSWebview'] && (this['btn_copy_link']['visible'] = !0, this['btn_copy_link']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Laya['Browser']['window']['wkbridge']['callNative']('copy2clip', D['room_link'].text, function () { }),
                                        f['UIBase']['anim_pop_hide'](D['popout'], Laya['Handler']['create'](D, function () {
                                            D['popout']['visible'] = !1;
                                        })),
                                        f['UI_FlyTips']['ShowTips'](game['Tools']['strOfLocalization'](2125));
                                }, null, !1)),
                                this['popout']['visible'] = !1,
                                this['popout']['getChildByName']('btn_cancel')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    f['UIBase']['anim_pop_hide'](D['popout'], Laya['Handler']['create'](D, function () {
                                        D['popout']['visible'] = !1;
                                    }));
                                }, null, !1),
                                this['invitefriend'] = new H(this.me['getChildByName']('invite_friend')),
                                this['pop_change_view'] = new N(this.me['getChildByName']('pop_view'));
                        },
                        K['prototype'].show = function () {
                            var H = this;
                            game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['mousein_copy'] = !1,
                                this['beReady'] = !1,
                                this['invitefriend'].me['visible'] = !1,
                                this['btn_add_robot']['visible'] = !1,
                                this['btn_invite_friend']['visible'] = !1,
                                game['Tools']['setGrayDisable'](this['btn_dress'], !1),
                                this['pre_choose'] = null,
                                this['pop_change_view']['close'](!0);
                            for (var N = 0; 4 > N; N++)
                                this['player_cells'][N]['container']['visible'] = N < this['max_player_count'];
                            for (var N = 0; N < this['max_player_count']; N++)
                                this['_clearCell'](N);
                            for (var N = 0; N < this['players']['length']; N++)
                                this['players'][N]['cell_index'] = N, this['_refreshPlayerInfo'](this['players'][N]);
                            this['msg_tail'] = -1,
                                this['pre_msgs'] = [],
                                this['posted'] = !1;
                            var Q = {};
                            Q.type = 'show',
                                Q['players'] = this['players'],
                                this['push_msg'](JSON['stringify'](Q)),
                                this['owner_id'] == GameMgr.Inst['account_id'] ? (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']), this['refreshAsOwner']()) : (this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_ok'], !1)),
                                this['label_rommid'].text = 'en' == GameMgr['client_language'] ? '#' + this['room_id']['toString']() : this['room_id']['toString']();
                            var D = [];
                            D.push(game['Tools']['room_mode_desc'](this['room_mode'].mode));
                            var K = this['room_mode']['detail_rule'];
                            if (K) {
                                var b = 5,
                                    I = 20;
                                if (null != K['time_fixed'] && (b = K['time_fixed']), null != K['time_add'] && (I = K['time_add']), D.push(b['toString']() + '+' + I['toString']() + game['Tools']['strOfLocalization'](2019)), 0 != this['tournament_id']) {
                                    var q = cfg['tournament']['tournaments'].get(this['tournament_id']);
                                    q && D.push(q.name);
                                }
                                if (null != K['init_point'] && D.push(game['Tools']['strOfLocalization'](2199) + K['init_point']), null != K['fandian'] && D.push(game['Tools']['strOfLocalization'](2094) + ':' + K['fandian']), K['guyi_mode'] && D.push(game['Tools']['strOfLocalization'](3028)), null != K['dora_count'])
                                    switch (K['chuanma'] && (K['dora_count'] = 0), K['dora_count']) {
                                        case 0:
                                            D.push(game['Tools']['strOfLocalization'](2044));
                                            break;
                                        case 2:
                                            D.push(game['Tools']['strOfLocalization'](2047));
                                            break;
                                        case 3:
                                            D.push(game['Tools']['strOfLocalization'](2045));
                                            break;
                                        case 4:
                                            D.push(game['Tools']['strOfLocalization'](2046));
                                    }
                                null != K['shiduan'] && 1 != K['shiduan'] && D.push(game['Tools']['strOfLocalization'](2137)),
                                    2 === K['fanfu'] && D.push(game['Tools']['strOfLocalization'](2763)),
                                    4 === K['fanfu'] && D.push(game['Tools']['strOfLocalization'](2764)),
                                    null != K['bianjietishi'] && 1 != K['bianjietishi'] && D.push(game['Tools']['strOfLocalization'](2200)),
                                    this['room_mode'].mode >= 10 && this['room_mode'].mode <= 14 && (null != K['have_zimosun'] && 1 != K['have_zimosun'] ? D.push(game['Tools']['strOfLocalization'](2202)) : D.push(game['Tools']['strOfLocalization'](2203))),
                                    game['Tools']['setGrayDisable'](this['btn_copy'], 1 == this['max_player_count']);
                            }
                            this['container_rules'].show(D),
                                this['enable'] = !0,
                                this['locking'] = !0,
                                f['UIBase']['anim_alpha_in'](this['container_top'], {
                                    y: -30
                                }, 200);
                            for (var N = 0; N < this['player_cells']['length']; N++)
                                f['UIBase']['anim_alpha_in'](this['player_cells'][N]['container'], {
                                    x: 80
                                }, 150, 150 + 50 * N, null, Laya.Ease['backOut']);
                            f['UIBase']['anim_alpha_in'](this['btn_ok'], {}, 100, 600),
                                f['UIBase']['anim_alpha_in'](this['container_right'], {
                                    x: 20
                                }, 100, 500),
                                Laya['timer'].once(600, this, function () {
                                    H['locking'] = !1;
                                });
                            var a = game['Tools']['room_mode_desc'](this['room_mode'].mode);
                            this['room_link'].text = game['Tools']['strOfLocalization'](2221, [this['room_id']['toString']()]),
                                '' != a && (this['room_link'].text += '(' + a + ')');
                            var J = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                            this['room_link'].text += ': ' + J + '?room=' + this['room_id'];
                        },
                        K['prototype']['leaveRoom'] = function () {
                            var H = this;
                            this['locking'] || app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (N, Q) {
                                N || Q['error'] ? f['UIMgr'].Inst['showNetReqError']('leaveRoom', N, Q) : (H['room_id'] = -1, H.hide(Laya['Handler']['create'](H, function () {
                                    f['UI_Lobby'].Inst['enable'] = !0;
                                })));
                            });
                        },
                        K['prototype']['tryToClose'] = function (H) {
                            var N = this;
                            app['NetAgent']['sendReq2Lobby']('Lobby', 'leaveRoom', {}, function (Q, D) {
                                Q || D['error'] ? (f['UIMgr'].Inst['showNetReqError']('leaveRoom', Q, D), H['runWith'](!1)) : (N['enable'] = !1, N['pop_change_view']['close'](!0), H['runWith'](!0));
                            });
                        },
                        K['prototype'].hide = function (H) {
                            var N = this;
                            this['locking'] = !0,
                                f['UIBase']['anim_alpha_out'](this['container_top'], {
                                    y: -30
                                }, 150);
                            for (var Q = 0; Q < this['player_cells']['length']; Q++)
                                f['UIBase']['anim_alpha_out'](this['player_cells'][Q]['container'], {
                                    x: 80
                                }, 150, 0, null);
                            f['UIBase']['anim_alpha_out'](this['btn_ok'], {}, 150),
                                f['UIBase']['anim_alpha_out'](this['container_right'], {
                                    x: 20
                                }, 150),
                                Laya['timer'].once(200, this, function () {
                                    N['locking'] = !1,
                                        N['enable'] = !1,
                                        H && H.run();
                                }),
                                document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        K['prototype']['onDisbale'] = function () {
                            Laya['timer']['clearAll'](this);
                            for (var f = 0; f < this['player_cells']['length']; f++)
                                Laya['loader']['clearTextureRes'](this['player_cells'][f]['illust'].skin);
                            document['getElementById']('layaCanvas')['onclick'] = null;
                        },
                        K['prototype']['switchReady'] = function () {
                            this['owner_id'] != GameMgr.Inst['account_id'] && (this['beReady'] = !this['beReady'], this['btn_ok'].skin = game['Tools']['localUISrc'](this['beReady'] ? this['skin_cancel'] : this['skin_ready']), game['Tools']['setGrayDisable'](this['btn_dress'], this['beReady']), app['NetAgent']['sendReq2Lobby']('Lobby', 'readyPlay', {
                                ready: this['beReady'],
                                dressing: !1
                            }, function () { }));
                        },
                        K['prototype']['getStart'] = function () {
                            this['owner_id'] == GameMgr.Inst['account_id'] && (Laya['timer']['currTimer'] < this['last_start_room'] + 2000 || (this['last_start_room'] = Laya['timer']['currTimer'], app['NetAgent']['sendReq2Lobby']('Lobby', 'startRoom', {}, function (H, N) {
                                (H || N['error']) && f['UIMgr'].Inst['showNetReqError']('startRoom', H, N);
                            })));
                        },
                        K['prototype']['kickPlayer'] = function (H) {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                var N = this['players'][H];
                                1 == N['category'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'kickPlayer', {
                                    account_id: this['players'][H]['account_id']
                                }, function () { }) : 2 == N['category'] && (this['pre_choose'] = N, app['NetAgent']['sendReq2Lobby']('Lobby', 'modifyRoom', {
                                    robot_count: this['robot_count'] - 1
                                }, function (H, N) {
                                    (H || N['error']) && f['UIMgr'].Inst['showNetReqError']('modifyRoom_minus', H, N);
                                }));
                            }
                        },
                        K['prototype']['_clearCell'] = function (f) {
                            if (!(0 > f || f >= this['player_cells']['length'])) {
                                var H = this['player_cells'][f];
                                H['container_flag']['visible'] = !1,
                                    H['container_illust']['visible'] = !1,
                                    H.name['visible'] = !1,
                                    H['container_name']['visible'] = !1,
                                    H['btn_t']['visible'] = !1,
                                    H.host['visible'] = !1,
                                    H['illust']['clear']();
                            }
                        },
                        K['prototype']['_refreshPlayerInfo'] = function (f) {
                            var H = f['cell_index'];
                            if (!(0 > H || H >= this['player_cells']['length'])) {
                                var N = this['player_cells'][H];
                                N['container_illust']['visible'] = !0,
                                    N['container_name']['visible'] = !0,
                                    N.name['visible'] = !0,
                                    game['Tools']['SetNickname'](N.name, f, GameMgr.Inst['hide_nickname']),
                                    N['btn_t']['visible'] = this['owner_id'] == GameMgr.Inst['account_id'] && f['account_id'] != GameMgr.Inst['account_id'],
                                    this['owner_id'] == f['account_id'] && (N['container_flag']['visible'] = !0, N.host['visible'] = !0),
                                    f['account_id'] == GameMgr.Inst['account_id'] ? N['illust']['setSkin'](f['avatar_id'], 'waitingroom') : N['illust']['setSkin'](game['GameUtility']['get_limited_skin_id'](f['avatar_id']), 'waitingroom'),
                                    N['title'].id = game['Tools']['titleLocalization'](f['account_id'], f['title']),
                                    N.rank.id = f[this['room_mode'].mode < 10 ? 'level' : 'level3'].id,
                                    this['_onPlayerReadyChange'](f);
                            }
                        },
                        K['prototype']['_onPlayerReadyChange'] = function (f) {
                            var H = f['cell_index'];
                            if (!(0 > H || H >= this['player_cells']['length'])) {
                                var N = this['player_cells'][H];
                                N['container_flag']['visible'] = this['owner_id'] == f['account_id'] ? !0 : f['ready'];
                            }
                        },
                        K['prototype']['refreshAsOwner'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                for (var f = 0, H = 0; H < this['players']['length']; H++)
                                    0 != this['players'][H]['category'] && (this['_refreshPlayerInfo'](this['players'][H]), f++);
                                this['btn_add_robot']['visible'] = !0,
                                    this['btn_invite_friend']['visible'] = !0,
                                    game['Tools']['setGrayDisable'](this['btn_invite_friend'], f == this['max_player_count']),
                                    game['Tools']['setGrayDisable'](this['btn_add_robot'], f == this['max_player_count']),
                                    this['refreshStart']();
                            }
                        },
                        K['prototype']['refreshStart'] = function () {
                            if (this['owner_id'] == GameMgr.Inst['account_id']) {
                                this['btn_ok'].skin = game['Tools']['localUISrc'](this['skin_start']),
                                    game['Tools']['setGrayDisable'](this['btn_dress'], !1);
                                for (var f = 0, H = 0; H < this['players']['length']; H++) {
                                    var N = this['players'][H];
                                    if (!N || 0 == N['category'])
                                        break;
                                    (N['account_id'] == this['owner_id'] || N['ready']) && f++;
                                }
                                if (game['Tools']['setGrayDisable'](this['btn_ok'], f != this['max_player_count']), this['enable']) {
                                    for (var Q = 0, H = 0; H < this['max_player_count']; H++) {
                                        var D = this['player_cells'][H];
                                        D && D['container_flag']['visible'] && Q++;
                                    }
                                    if (f != Q && !this['posted']) {
                                        this['posted'] = !0;
                                        var K = {};
                                        K['okcount'] = f,
                                            K['okcount2'] = Q,
                                            K.msgs = [];
                                        var b = 0,
                                            I = this['pre_msgs']['length'] - 1;
                                        if (-1 != this['msg_tail'] && (b = (this['msg_tail'] + 1) % this['pre_msgs']['length'], I = this['msg_tail']), b >= 0 && I >= 0) {
                                            for (var H = b; H != I; H = (H + 1) % this['pre_msgs']['length'])
                                                K.msgs.push(this['pre_msgs'][H]);
                                            K.msgs.push(this['pre_msgs'][I]);
                                        }
                                        GameMgr.Inst['postInfo2Server']('waitroom_err2', K, !1);
                                    }
                                }
                            }
                        },
                        K['prototype']['onGameStart'] = function (f) {
                            game['Tools']['setGrayDisable'](this['btn_ok'], !0),
                                this['enable'] = !1,
                                game['MJNetMgr'].Inst['OpenConnect'](f['connect_token'], f['game_uuid'], f['location'], !1, null);
                        },
                        K['prototype']['onEnable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !0);
                        },
                        K['prototype']['onDisable'] = function () {
                            game['TempImageMgr']['setUIEnable']('UI_WaitingRoom', !1);
                        },
                        K.Inst = null,
                        K;
                }
                    (f['UIBase']);
            f['UI_WaitingRoom'] = D;
        }
            (uiscript || (uiscript = {}));











        // 保存装扮
        !function (f) {
            var H;
            !function (H) {
                var N = function () {
                    function N(N, Q, D) {
                        var K = this;
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
                            this['_locking'] = D,
                            this['container_zhuangban0'] = N,
                            this['container_zhuangban1'] = Q;
                        var b = this['container_zhuangban0']['getChildByName']('tabs');
                        b['vScrollBarSkin'] = '';
                        for (var I = function (H) {
                            var N = b['getChildAt'](H);
                            q.tabs.push(N),
                                N['clickHandler'] = new Laya['Handler'](q, function () {
                                    K['locking'] || K['tab_index'] != H && (K['_changed'] ? f['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3022), Laya['Handler']['create'](K, function () {
                                        K['change_tab'](H);
                                    }), null) : K['change_tab'](H));
                                });
                        }, q = this, a = 0; a < b['numChildren']; a++)
                            I(a);
                        this['page_items'] = new H['Page_Items'](this['container_zhuangban1']['getChildByName']('page_items'), this),
                            this['page_headframe'] = new H['Page_Headframe'](this['container_zhuangban1']['getChildByName']('page_headframe')),
                            this['page_bgm'] = new H['Page_Bgm'](this['container_zhuangban1']['getChildByName']('page_bgm'), this),
                            this['page_desktop'] = new H['Page_Desktop'](this['container_zhuangban1']['getChildByName']('page_zhuobu'), this),
                            this['scrollview'] = this['container_zhuangban1']['getChildByName']('page_slots')['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_view'])),
                            this['scrollview']['setElastic'](),
                            this['btn_using'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_using'),
                            this['btn_save'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_save'),
                            this['btn_save']['clickHandler'] = new Laya['Handler'](this, function () {
                                for (var H = [], N = 0; N < K['cell_titles']['length']; N++) {
                                    var Q = K['slot_ids'][N];
                                    if (K['slot_map'][Q]) {
                                        var D = K['slot_map'][Q];
                                        if (!(D['item_id'] && D['item_id'] != K['cell_default_item'][N] || D['item_id_list'] && 0 != D['item_id_list']['length']))
                                            continue;
                                        var b = [];
                                        if (D['item_id_list'])
                                            for (var I = 0, q = D['item_id_list']; I < q['length']; I++) {
                                                var a = q[I];
                                                a == K['cell_default_item'][N] ? b.push(0) : b.push(a);
                                            }
                                        H.push({
                                            slot: Q,
                                            item_id: D['item_id'],
                                            type: D.type,
                                            item_id_list: b
                                        });
                                    }
                                }
                                K['btn_save']['mouseEnabled'] = !1;
                                var J = K['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'saveCommonViews', {
                                //    views: H,
                                //    save_index: J,
                                //    is_use: J == f['UI_Sushe']['using_commonview_index'] ? 1 : 0
                                //}, function (N, Q) {
                                //    if (K['btn_save']['mouseEnabled'] = !0, N || Q['error'])
                                //        f['UIMgr'].Inst['showNetReqError']('saveCommonViews', N, Q);
                                //    else {
                                if (f['UI_Sushe']['commonViewList']['length'] < J)
                                    for (var D = f['UI_Sushe']['commonViewList']['length']; J >= D; D++)
                                        f['UI_Sushe']['commonViewList'].push([]);
                                MMP.settings.commonViewList = f.UI_Sushe.commonViewList;
                                MMP.settings.using_commonview_index = f.UI_Sushe.using_commonview_index;
                                MMP.saveSettings();
                                //END
                                if (f['UI_Sushe']['commonViewList'][J] = H, f['UI_Sushe']['using_commonview_index'] == J && K['onChangeGameView'](), K['tab_index'] != J)
                                    return;
                                K['btn_save']['mouseEnabled'] = !0,
                                    K['_changed'] = !1,
                                    K['refresh_btn']();
                                //    }
                                //});
                            }),
                            this['btn_use'] = this['container_zhuangban1']['getChildByName']('page_slots')['getChildByName']('btn_use'),
                            this['btn_use']['clickHandler'] = new Laya['Handler'](this, function () {
                                K['btn_use']['mouseEnabled'] = !1;
                                var H = K['tab_index'];
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'useCommonView', {
                                //    index: H
                                //}, function (N, Q) {
                                //    K['btn_use']['mouseEnabled'] = !0,
                                //    N || Q['error'] ? f['UIMgr'].Inst['showNetReqError']('useCommonView', N, Q) : (
                                f['UI_Sushe']['using_commonview_index'] = H, K['refresh_btn'](), K['refresh_tab'](), K['onChangeGameView']();//);
                                //});
                            }),
                            this['random'] = this['container_zhuangban1']['getChildByName']('random'),
                            this['random_slider'] = this['random']['getChildByName']('slider'),
                            this['btn_random'] = this['random']['getChildByName']('btn'),
                            this['btn_random']['clickHandler'] = new Laya['Handler'](this, function () {
                                K['onRandomBtnClick']();
                            });
                    }
                    return Object['defineProperty'](N['prototype'], 'locking', {
                        get: function () {
                            return this['_locking'] ? this['_locking'].run() : !1;
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                        Object['defineProperty'](N['prototype'], 'changed', {
                            get: function () {
                                return this['_changed'];
                            },
                            enumerable: !1,
                            configurable: !0
                        }),
                        N['prototype'].show = function (H) {
                            game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !0),
                                this['container_zhuangban0']['visible'] = !0,
                                this['container_zhuangban1']['visible'] = !0,
                                H ? (this['container_zhuangban0']['alpha'] = 1, this['container_zhuangban1']['alpha'] = 1) : (f['UIBase']['anim_alpha_in'](this['container_zhuangban0'], {
                                    x: 0
                                }, 200), f['UIBase']['anim_alpha_in'](this['container_zhuangban1'], {
                                    x: 0
                                }, 200)),
                                this['change_tab'](f['UI_Sushe']['using_commonview_index']);
                        },
                        N['prototype']['change_tab'] = function (H) {
                            if (this['tab_index'] = H, this['refresh_tab'](), this['slot_map'] = {}, this['scrollview']['reset'](), this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['select_index'] = 0, this['_changed'] = !1, !(this['tab_index'] < 0 || this['tab_index'] > 9)) {
                                if (this['tab_index'] < f['UI_Sushe']['commonViewList']['length'])
                                    for (var N = f['UI_Sushe']['commonViewList'][this['tab_index']], Q = 0; Q < N['length']; Q++)
                                        this['slot_map'][N[Q].slot] = {
                                            slot: N[Q].slot,
                                            item_id: N[Q]['item_id'],
                                            type: N[Q].type,
                                            item_id_list: N[Q]['item_id_list']
                                        };
                                this['scrollview']['addItem'](this['cell_titles']['length']),
                                    this['onChangeSlotSelect'](0),
                                    this['refresh_btn']();
                            }
                        },
                        N['prototype']['refresh_tab'] = function () {
                            for (var H = 0; H < this.tabs['length']; H++) {
                                var N = this.tabs[H];
                                N['mouseEnabled'] = this['tab_index'] != H,
                                    N['getChildByName']('bg').skin = game['Tools']['localUISrc'](this['tab_index'] == H ? 'myres/sushe/tab_choosed.png' : 'myres/sushe/tab_unchoose.png'),
                                    N['getChildByName']('num')['color'] = this['tab_index'] == H ? '#2f1e19' : '#f2c797';
                                var Q = N['getChildByName']('choosed');
                                f['UI_Sushe']['using_commonview_index'] == H ? (Q['visible'] = !0, Q.x = this['tab_index'] == H ? -18 : -4) : Q['visible'] = !1;
                            }
                        },
                        N['prototype']['refresh_btn'] = function () {
                            this['btn_save']['visible'] = !1,
                                this['btn_save']['mouseEnabled'] = !0,
                                this['btn_use']['visible'] = !1,
                                this['btn_use']['mouseEnabled'] = !0,
                                this['btn_using']['visible'] = !1,
                                this['_changed'] ? this['btn_save']['visible'] = !0 : (this['btn_use']['visible'] = f['UI_Sushe']['using_commonview_index'] != this['tab_index'], this['btn_using']['visible'] = f['UI_Sushe']['using_commonview_index'] == this['tab_index']);
                        },
                        N['prototype']['onChangeSlotSelect'] = function (f) {
                            var H = this;
                            this['select_index'] = f,
                                this['random']['visible'] = !(6 == f || 10 == f);
                            var N = 0;
                            f >= 0 && f < this['cell_default_item']['length'] && (N = this['cell_default_item'][f]);
                            var Q = N,
                                D = this['slot_ids'][f],
                                K = !1,
                                b = [];
                            if (this['slot_map'][D]) {
                                var I = this['slot_map'][D];
                                b = I['item_id_list'],
                                    K = !!I.type,
                                    I['item_id'] && (Q = this['slot_map'][D]['item_id']),
                                    K && I['item_id_list'] && I['item_id_list']['length'] > 0 && (Q = I['item_id_list'][0]);
                            }
                            var q = Laya['Handler']['create'](this, function (Q) {
                                Q == N && (Q = 0);
                                var K = !1;
                                if (H['is_random']) {
                                    var b = H['slot_map'][D]['item_id_list']['indexOf'](Q);
                                    b >= 0 ? (H['slot_map'][D]['item_id_list']['splice'](b, 1), K = !0) : (H['slot_map'][D]['item_id_list'] && 0 != H['slot_map'][D]['item_id_list']['length'] || (H['slot_map'][D]['item_id_list'] = []), H['slot_map'][D]['item_id_list'].push(Q));
                                } else
                                    H['slot_map'][D] || (H['slot_map'][D] = {}), H['slot_map'][D]['item_id'] = Q;
                                return H['scrollview']['wantToRefreshItem'](f),
                                    H['_changed'] = !0,
                                    H['refresh_btn'](),
                                    K;
                            }, null, !1);
                            this['page_items']['close'](),
                                this['page_desktop']['close'](),
                                this['page_headframe']['close'](),
                                this['page_bgm']['close'](),
                                this['is_random'] = K,
                                this['random_slider'].x = K ? 76 : -4,
                                this['random']['getChildAt'](1)['visible'] = !this['is_random'],
                                this['random']['getChildAt'](2)['visible'] = this['is_random'];
                            var a = game['Tools']['strOfLocalization'](this['cell_titles'][f]);
                            if (f >= 0 && 2 >= f)
                                this['page_items'].show(a, f, Q, q), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (3 == f)
                                this['page_items'].show(a, 10, Q, q), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (4 == f)
                                this['page_items'].show(a, 3, Q, q), this['setRandomGray'](!this['page_items']['can_random']());
                            else if (5 == f)
                                this['page_bgm'].show(a, Q, q), this['setRandomGray'](!this['page_bgm']['can_random']());
                            else if (6 == f)
                                this['page_headframe'].show(a, Q, q);
                            else if (7 == f || 8 == f) {
                                var J = this['cell_default_item'][7],
                                    k = this['cell_default_item'][8];
                                if (7 == f) {
                                    if (J = Q, this['slot_map'][game['EView'].mjp]) {
                                        var r = this['slot_map'][game['EView'].mjp];
                                        r.type && r['item_id_list'] && r['item_id_list']['length'] > 0 ? k = r['item_id_list'][0] : r['item_id'] && (k = r['item_id']);
                                    }
                                    this['page_desktop']['show_desktop'](a, J, k, q);
                                } else {
                                    if (k = Q, this['slot_map'][game['EView']['desktop']]) {
                                        var r = this['slot_map'][game['EView']['desktop']];
                                        r.type && r['item_id_list'] && r['item_id_list']['length'] > 0 ? J = r['item_id_list'][0] : r['item_id'] && (J = r['item_id']);
                                    }
                                    this['page_desktop']['show_mjp'](a, J, k, q);
                                }
                                this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else if (9 == f) {
                                var J = this['cell_default_item'][7],
                                    k = this['cell_default_item'][9];
                                if (k = Q, this['slot_map'][game['EView']['desktop']]) {
                                    var r = this['slot_map'][game['EView']['desktop']];
                                    r.type && r['item_id_list'] && r['item_id_list']['length'] > 0 ? J = r['item_id_list'][0] : r['item_id'] && (J = r['item_id']);
                                }
                                this['page_desktop']['show_mjp_surface'](a, J, k, q),
                                    this['setRandomGray'](!this['page_desktop']['can_random']());
                            } else
                                10 == f && this['page_desktop']['show_lobby_bg'](a, Q, q);
                        },
                        N['prototype']['onRandomBtnClick'] = function () {
                            var f = this;
                            if (6 != this['select_index'] && 10 != this['select_index']) {
                                this['_changed'] = !0,
                                    this['refresh_btn'](),
                                    this['is_random'] = !this['is_random'],
                                    this['random']['getChildAt'](this['is_random'] ? 2 : 1)['visible'] = !0,
                                    Laya['Tween'].to(this['random_slider'], {
                                        x: this['is_random'] ? 76 : -4
                                    }, 100, null, Laya['Handler']['create'](this, function () {
                                        f['random']['getChildAt'](f['is_random'] ? 1 : 2)['visible'] = !1;
                                    }));
                                var H = this['select_index'],
                                    N = this['slot_ids'][H],
                                    Q = 0;
                                H >= 0 && H < this['cell_default_item']['length'] && (Q = this['cell_default_item'][H]);
                                var D = Q,
                                    K = [];
                                if (this['slot_map'][N]) {
                                    var b = this['slot_map'][N];
                                    K = b['item_id_list'],
                                        b['item_id'] && (D = this['slot_map'][N]['item_id']);
                                }
                                if (H >= 0 && 4 >= H) {
                                    var I = this['slot_map'][N];
                                    I ? (I.type = I.type ? 0 : 1, I['item_id_list'] && 0 != I['item_id_list']['length'] || (I['item_id_list'] = [I['item_id']])) : this['slot_map'][N] = {
                                        type: 1,
                                        item_id_list: [this['page_items']['items'][0]]
                                    },
                                        this['page_items']['changeRandomState'](D);
                                } else if (5 == H) {
                                    var I = this['slot_map'][N];
                                    if (I)
                                        I.type = I.type ? 0 : 1, I['item_id_list'] && 0 != I['item_id_list']['length'] || (I['item_id_list'] = [I['item_id']]);
                                    else {
                                        this['slot_map'][N] = {
                                            type: 1,
                                            item_id_list: [this['page_bgm']['items'][0]]
                                        };
                                    }
                                    this['page_bgm']['changeRandomState'](D);
                                } else if (7 == H || 8 == H || 9 == H) {
                                    var I = this['slot_map'][N];
                                    I ? (I.type = I.type ? 0 : 1, I['item_id_list'] && 0 != I['item_id_list']['length'] || (I['item_id_list'] = [I['item_id']])) : this['slot_map'][N] = {
                                        type: 1,
                                        item_id_list: [this['page_desktop']['getFirstOwnedId']()]
                                    },
                                        this['page_desktop']['changeRandomState'](D);
                                }
                                this['scrollview']['wantToRefreshItem'](H);
                            }
                        },
                        N['prototype']['render_view'] = function (f) {
                            var H = this,
                                N = f['container'],
                                Q = f['index'],
                                D = N['getChildByName']('cell');
                            this['select_index'] == Q ? (D['scaleX'] = D['scaleY'] = 1.05, D['getChildByName']('choosed')['visible'] = !0) : (D['scaleX'] = D['scaleY'] = 1, D['getChildByName']('choosed')['visible'] = !1),
                                D['getChildByName']('title').text = game['Tools']['strOfLocalization'](this['cell_titles'][Q]);
                            var K = D['getChildByName']('name'),
                                b = D['getChildByName']('icon'),
                                I = this['cell_default_item'][Q],
                                q = this['slot_ids'][Q],
                                a = !1;
                            if (this['slot_map'][q] && (a = this['slot_map'][q].type, this['slot_map'][q]['item_id'] && (I = this['slot_map'][q]['item_id'])), a)
                                K.text = game['Tools']['strOfLocalization'](3752, ['' + this['slot_map'][q]['item_id_list']['length']]), game['LoadMgr']['setImgSkin'](b, 'myres/sushe/icon_random.jpg');
                            else {
                                var J = cfg['item_definition'].item.get(I);
                                J ? (K.text = J['name_' + GameMgr['client_language']], game['LoadMgr']['setImgSkin'](b, J.icon, null, 'UI_Sushe_Select.Zhuangban')) : (K.text = game['Tools']['strOfLocalization'](this['cell_names'][Q]), game['LoadMgr']['setImgSkin'](b, this['cell_default_img'][Q], null, 'UI_Sushe_Select.Zhuangban'));
                            }
                            var k = D['getChildByName']('btn');
                            k['clickHandler'] = Laya['Handler']['create'](this, function () {
                                H['locking'] || H['select_index'] != Q && (H['onChangeSlotSelect'](Q), H['scrollview']['wantToRefreshAll']());
                            }, null, !1),
                                k['mouseEnabled'] = this['select_index'] != Q;
                        },
                        N['prototype']['close'] = function (H) {
                            var N = this;
                            this['container_zhuangban0']['visible'] && (H ? (this['page_items']['close'](), this['page_desktop']['close'](), this['page_headframe']['close'](), this['page_bgm']['close'](), this['container_zhuangban0']['visible'] = !1, this['container_zhuangban1']['visible'] = !1, game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1)) : (f['UIBase']['anim_alpha_out'](this['container_zhuangban0'], {
                                x: 0
                            }, 200), f['UIBase']['anim_alpha_out'](this['container_zhuangban1'], {
                                x: 0
                            }, 200, 0, Laya['Handler']['create'](this, function () {
                                N['page_items']['close'](),
                                    N['page_desktop']['close'](),
                                    N['page_headframe']['close'](),
                                    N['page_bgm']['close'](),
                                    N['container_zhuangban0']['visible'] = !1,
                                    N['container_zhuangban1']['visible'] = !1,
                                    game['TempImageMgr']['setUIEnable']('UI_Sushe_Select.Zhuangban', !1);
                            }))));
                        },
                        N['prototype']['onChangeGameView'] = function () {
                            // 保存装扮页
                            MMP.settings.using_commonview_index = f.UI_Sushe.using_commonview_index;
                            MMP.saveSettings();
                            // END
                            f['UI_Sushe']['randomDesktopID'](),
                                GameMgr.Inst['load_mjp_view']();
                            var H = game['GameUtility']['get_view_id'](game['EView']['lobby_bg']);
                            f['UI_Lite_Loading'].Inst.show(),
                                game['Scene_Lobby'].Inst['set_lobby_bg'](H, Laya['Handler']['create'](this, function () {
                                    f['UI_Lite_Loading'].Inst['enable'] && f['UI_Lite_Loading'].Inst['close']();
                                })),
                                GameMgr.Inst['account_data']['avatar_frame'] = game['GameUtility']['get_view_id'](game['EView']['head_frame']);
                        },
                        N['prototype']['setRandomGray'] = function (H) {
                            this['btn_random']['visible'] = !H,
                                this['random']['filters'] = H ? [new Laya['ColorFilter'](f['GRAY_FILTER'])] : [];
                        },
                        N['prototype']['getShowSlotInfo'] = function () {
                            return this['slot_map'][this['slot_ids'][this['select_index']]];
                        },
                        N['prototype']['changeSlotByItemId'] = function (f) {
                            var H = cfg['item_definition'].item.get(f);
                            if (H)
                                for (var N = 0; N < this['slot_ids']['length']; N++)
                                    if (this['slot_ids'][N] == H.type)
                                        return this['onChangeSlotSelect'](N), this['scrollview']['wantToRefreshAll'](), void 0;
                        },
                        N;
                }
                    ();
                H['Container_Zhuangban'] = N;
            }
                (H = f['zhuangban'] || (f['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));











        // 设置称号
        !function (f) {
            var H = function (H) {
                function N() {
                    var f = H.call(this, new ui['lobby']['titlebookUI']()) || this;
                    return f['_root'] = null,
                        f['_scrollview'] = null,
                        f['_blackmask'] = null,
                        f['_locking'] = !1,
                        f['_showindexs'] = [],
                        N.Inst = f,
                        f;
                }
                return __extends(N, H),
                    N.Init = function () {
                        var H = this;
                        // 获取称号
                        //if (GameMgr.Inst['use_fetch_info'])
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchTitleList', {}, function (N, Q) {
                        //if (N || Q['error'])
                        //    f['UIMgr'].Inst['showNetReqError']('fetchTitleList', N, Q);
                        //else {
                        //    H['owned_title'] = [];
                        //    for (var D = 0; D < Q['title_list']['length']; D++) {
                        //        var K = Q['title_list'][D];
                        for (let title of cfg.item_definition.title.rows_) {
                            var K = title.id;
                            cfg['item_definition']['title'].get(K) && H['owned_title'].push(K),
                                '600005' == K && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                K >= '600005' && '600015' >= K && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + K - '600005', 1);
                        }
                        //    }
                        //});
                    },
                    N['onFetchSuccess'] = function (f) {
                        if (this['owned_title'] = [], f['title_list'] && f['title_list']['title_list'])
                            // START
                            //for (var H = 0; H < f['title_list']['title_list']['length']; H++) {
                            //    var N = f['title_list']['title_list'][H];
                            // END
                            for (let title of cfg.item_definition.title.rows_) {
                                var N = title.id;
                                cfg['item_definition']['title'].get(N) && this['owned_title'].push(N),
                                    '600005' == N && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1),
                                    N >= '600005' && '600015' >= N && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + N - '600005', 1);
                            }
                    },
                    N['title_update'] = function (H) {
                        for (var N = 0; N < H['new_titles']['length']; N++)
                            cfg['item_definition']['title'].get(H['new_titles'][N]) && this['owned_title'].push(H['new_titles'][N]), '600005' == H['new_titles'][N] && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Get_The_Title1'], 1), H['new_titles'][N] >= '600005' && H['new_titles'][N] <= '600015' && app['PlayerBehaviorStatistic']['google_trace_pending'](app['EBehaviorType']['G_get_title_1'] + H['new_titles'][N] - '600005', 1);
                        if (H['remove_titles'] && H['remove_titles']['length'] > 0) {
                            for (var N = 0; N < H['remove_titles']['length']; N++) {
                                for (var Q = H['remove_titles'][N], D = 0; D < this['owned_title']['length']; D++)
                                    if (this['owned_title'][D] == Q) {
                                        this['owned_title'][D] = this['owned_title'][this['owned_title']['length'] - 1],
                                            this['owned_title'].pop();
                                        break;
                                    }
                                Q == GameMgr.Inst['account_data']['title'] && (GameMgr.Inst['account_data']['title'] = '600001', f['UI_Lobby'].Inst['enable'] && f['UI_Lobby'].Inst.top['refresh'](), f['UI_PlayerInfo'].Inst['enable'] && f['UI_PlayerInfo'].Inst['refreshBaseInfo']());
                            }
                            this.Inst['enable'] && this.Inst.show();
                        }
                    },
                    N['prototype']['onCreate'] = function () {
                        var H = this;
                        this['_root'] = this.me['getChildByName']('root'),
                            this['_blackmask'] = new f['UI_BlackMask'](this.me['getChildByName']('bmask'), Laya['Handler']['create'](this, function () {
                                return H['_locking'];
                            }, null, !1), Laya['Handler']['create'](this, this['close'], null, !1)),
                            this['_scrollview'] = this['_root']['getChildByName']('content')['scriptMap']['capsui.CScrollView'],
                            this['_scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (f) {
                                H['setItemValue'](f['index'], f['container']);
                            }, null, !1)),
                            this['_root']['getChildByName']('btn_close')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                H['_locking'] || (H['_blackmask'].hide(), H['close']());
                            }, null, !1),
                            this['_noinfo'] = this['_root']['getChildByName']('noinfo');
                    },
                    N['prototype'].show = function () {
                        var H = this;
                        if (this['_locking'] = !0, this['enable'] = !0, this['_blackmask'].show(), N['owned_title']['length'] > 0) {
                            this['_showindexs'] = [];
                            for (var Q = 0; Q < N['owned_title']['length']; Q++)
                                this['_showindexs'].push(Q);
                            this['_showindexs'] = this['_showindexs'].sort(function (f, H) {
                                var Q = f,
                                    D = cfg['item_definition']['title'].get(N['owned_title'][f]);
                                D && (Q += 1000 * D['priority']);
                                var K = H,
                                    b = cfg['item_definition']['title'].get(N['owned_title'][H]);
                                return b && (K += 1000 * b['priority']),
                                    K - Q;
                            }),
                                this['_scrollview']['reset'](),
                                this['_scrollview']['addItem'](N['owned_title']['length']),
                                this['_scrollview'].me['visible'] = !0,
                                this['_noinfo']['visible'] = !1;
                        } else
                            this['_noinfo']['visible'] = !0, this['_scrollview'].me['visible'] = !1;
                        f['UIBase']['anim_pop_out'](this['_root'], Laya['Handler']['create'](this, function () {
                            H['_locking'] = !1;
                        }));
                    },
                    N['prototype']['close'] = function () {
                        var H = this;
                        this['_locking'] = !0,
                            f['UIBase']['anim_pop_hide'](this['_root'], Laya['Handler']['create'](this, function () {
                                H['_locking'] = !1,
                                    H['enable'] = !1;
                            }));
                    },
                    N['prototype']['onEnable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !0);
                    },
                    N['prototype']['onDisable'] = function () {
                        game['TempImageMgr']['setUIEnable']('UI_TitleBook', !1),
                            this['_scrollview']['reset']();
                    },
                    N['prototype']['setItemValue'] = function (f, H) {
                        var Q = this;
                        if (this['enable']) {
                            var D = N['owned_title'][this['_showindexs'][f]],
                                K = cfg['item_definition']['title'].find(D);
                            game['LoadMgr']['setImgSkin'](H['getChildByName']('img_title'), K.icon, null, 'UI_TitleBook'),
                                H['getChildByName']('using')['visible'] = D == GameMgr.Inst['account_data']['title'],
                                H['getChildByName']('desc').text = K['desc_' + GameMgr['client_language']];
                            var b = H['getChildByName']('btn');
                            b['clickHandler'] = Laya['Handler']['create'](this, function () {
                                D != GameMgr.Inst['account_data']['title'] ? (Q['changeTitle'](f), H['getChildByName']('using')['visible'] = !0) : (Q['changeTitle'](-1), H['getChildByName']('using')['visible'] = !1);
                            }, null, !1);
                            var I = H['getChildByName']('time'),
                                q = H['getChildByName']('img_title');
                            if (1 == K['unlock_type']) {
                                var a = K['unlock_param'][0],
                                    J = cfg['item_definition'].item.get(a);
                                I.text = game['Tools']['strOfLocalization'](3121) + J['expire_desc_' + GameMgr['client_language']],
                                    I['visible'] = !0,
                                    q.y = 0;
                            } else
                                I['visible'] = !1, q.y = 10;
                        }
                    },
                    N['prototype']['changeTitle'] = function (H) {
                        var Q = this,
                            D = GameMgr.Inst['account_data']['title'],
                            K = 0;
                        K = H >= 0 && H < this['_showindexs']['length'] ? N['owned_title'][this['_showindexs'][H]] : '600001',
                            GameMgr.Inst['account_data']['title'] = K;
                        for (var b = -1, I = 0; I < this['_showindexs']['length']; I++)
                            if (D == N['owned_title'][this['_showindexs'][I]]) {
                                b = I;
                                break;
                            }
                        f['UI_Lobby'].Inst['enable'] && f['UI_Lobby'].Inst.top['refresh'](),
                            f['UI_PlayerInfo'].Inst['enable'] && f['UI_PlayerInfo'].Inst['refreshBaseInfo'](),
                            -1 != b && this['_scrollview']['wantToRefreshItem'](b),
                            // 屏蔽设置称号的网络请求并保存称号
                            MMP.settings.title = K;
                        MMP.saveSettings();
                        //app['NetAgent']['sendReq2Lobby']('Lobby', 'useTitle', {
                        //    title: '600001' == K ? 0 : K
                        //}, function (N, K) {
                        //    (N || K['error']) && (f['UIMgr'].Inst['showNetReqError']('useTitle', N, K), GameMgr.Inst['account_data']['title'] = D, f['UI_Lobby'].Inst['enable'] && f['UI_Lobby'].Inst.top['refresh'](), f['UI_PlayerInfo'].Inst['enable'] && f['UI_PlayerInfo'].Inst['refreshBaseInfo'](), Q['enable'] && (H >= 0 && H < Q['_showindexs']['length'] && Q['_scrollview']['wantToRefreshItem'](H), b >= 0 && b < Q['_showindexs']['length'] && Q['_scrollview']['wantToRefreshItem'](b)));
                        //});
                    },
                    N.Inst = null,
                    N['owned_title'] = [],
                    N;
            }
                (f['UIBase']);
            f['UI_TitleBook'] = H;
        }
            (uiscript || (uiscript = {}));










        // 友人房调整装扮
        !function (f) {
            var H;
            !function (H) {
                var N = function () {
                    function N(f) {
                        this['scrollview'] = null,
                            this['page_skin'] = null,
                            this['chara_infos'] = [],
                            this['choosed_chara_index'] = 0,
                            this['choosed_skin_id'] = 0,
                            this['star_char_count'] = 0,
                            this.me = f,
                            'chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language'] ? (this.me['getChildByName']('left')['visible'] = !0, this.me['getChildByName']('left_en')['visible'] = !1, this['scrollview'] = this.me['getChildByName']('left')['scriptMap']['capsui.CScrollView']) : (this.me['getChildByName']('left')['visible'] = !1, this.me['getChildByName']('left_en')['visible'] = !0, this['scrollview'] = this.me['getChildByName']('left_en')['scriptMap']['capsui.CScrollView']),
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_character_cell']), -1, 3),
                            this['scrollview']['setElastic'](),
                            this['page_skin'] = new H['Page_Skin'](this.me['getChildByName']('right'));
                    }
                    return N['prototype'].show = function (H) {
                        var N = this;
                        this.me['visible'] = !0,
                            H ? this.me['alpha'] = 1 : f['UIBase']['anim_alpha_in'](this.me, {
                                x: 0
                            }, 200, 0),
                            this['choosed_chara_index'] = 0,
                            this['chara_infos'] = [];
                        for (var Q = 0, D = f['UI_Sushe']['star_chars']; Q < D['length']; Q++)
                            for (var K = D[Q], b = 0; b < f['UI_Sushe']['characters']['length']; b++)
                                if (!f['UI_Sushe']['hidden_characters_map'][K] && f['UI_Sushe']['characters'][b]['charid'] == K) {
                                    this['chara_infos'].push({
                                        chara_id: f['UI_Sushe']['characters'][b]['charid'],
                                        skin_id: f['UI_Sushe']['characters'][b].skin,
                                        is_upgraded: f['UI_Sushe']['characters'][b]['is_upgraded']
                                    }),
                                        f['UI_Sushe']['main_character_id'] == f['UI_Sushe']['characters'][b]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1);
                                    break;
                                }
                        this['star_char_count'] = this['chara_infos']['length'];
                        for (var b = 0; b < f['UI_Sushe']['characters']['length']; b++)
                            f['UI_Sushe']['hidden_characters_map'][f['UI_Sushe']['characters'][b]['charid']] || -1 == f['UI_Sushe']['star_chars']['indexOf'](f['UI_Sushe']['characters'][b]['charid']) && (this['chara_infos'].push({
                                chara_id: f['UI_Sushe']['characters'][b]['charid'],
                                skin_id: f['UI_Sushe']['characters'][b].skin,
                                is_upgraded: f['UI_Sushe']['characters'][b]['is_upgraded']
                            }), f['UI_Sushe']['main_character_id'] == f['UI_Sushe']['characters'][b]['charid'] && (this['choosed_chara_index'] = this['chara_infos']['length'] - 1));
                        this['choosed_skin_id'] = this['chara_infos'][this['choosed_chara_index']]['skin_id'],
                            this['scrollview']['reset'](),
                            this['scrollview']['addItem'](this['chara_infos']['length']);
                        var I = this['chara_infos'][this['choosed_chara_index']];
                        this['page_skin'].show(I['chara_id'], I['skin_id'], Laya['Handler']['create'](this, function (f) {
                            N['choosed_skin_id'] = f,
                                I['skin_id'] = f,
                                N['scrollview']['wantToRefreshItem'](N['choosed_chara_index']);
                        }, null, !1));
                    },
                        N['prototype']['render_character_cell'] = function (H) {
                            var N = this,
                                Q = H['index'],
                                D = H['container'],
                                K = H['cache_data'];
                            K['index'] = Q;
                            var b = this['chara_infos'][Q];
                            K['inited'] || (K['inited'] = !0, K.skin = new f['UI_Character_Skin'](D['getChildByName']('btn')['getChildByName']('head')), K['bound'] = D['getChildByName']('btn')['getChildByName']('bound'));
                            var I = D['getChildByName']('btn');
                            I['getChildByName']('choose')['visible'] = Q == this['choosed_chara_index'],
                                K.skin['setSkin'](b['skin_id'], 'bighead'),
                                I['getChildByName']('using')['visible'] = Q == this['choosed_chara_index'];
                            var q = cfg['item_definition']['character'].find(b['chara_id']),
                                a = q['name_' + GameMgr['client_language'] + '2'] ? q['name_' + GameMgr['client_language'] + '2'] : q['name_' + GameMgr['client_language']],
                                J = I['getChildByName']('label_name');
                            if ('chs' == GameMgr['client_language'] || 'chs_t' == GameMgr['client_language']) {
                                J.text = a['replace']('-', '|')['replace'](/\./g, '·');
                                var k = /^[a-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]*$/;
                                J['leading'] = k.test(a) ? -15 : 0;
                            } else
                                J.text = a;
                            I['getChildByName']('star') && (I['getChildByName']('star')['visible'] = Q < this['star_char_count']);
                            var r = cfg['item_definition']['character'].get(b['chara_id']);
                            'en' == GameMgr['client_language'] || 'jp' == GameMgr['client_language'] || 'kr' == GameMgr['client_language'] ? K['bound'].skin = r.ur ? game['Tools']['localUISrc']('myres/sushe/bg_head_bound' + (b['is_upgraded'] ? '4.png' : '3.png')) : game['Tools']['localUISrc']('myres/sushe/en_head_bound' + (b['is_upgraded'] ? '2.png' : '.png')) : r.ur ? (K['bound'].pos(-10, -2), K['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (b['is_upgraded'] ? '6.png' : '5.png'))) : (K['bound'].pos(4, 20), K['bound'].skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (b['is_upgraded'] ? '4.png' : '3.png'))),
                                I['getChildByName']('bg').skin = game['Tools']['localUISrc']('myres/sushe/bg_head' + (b['is_upgraded'] ? '2.png' : '.png')),
                                D['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                    if (Q != N['choosed_chara_index']) {
                                        var f = N['choosed_chara_index'];
                                        N['choosed_chara_index'] = Q,
                                            N['choosed_skin_id'] = b['skin_id'],
                                            N['page_skin'].show(b['chara_id'], b['skin_id'], Laya['Handler']['create'](N, function (f) {
                                                N['choosed_skin_id'] = f,
                                                    b['skin_id'] = f,
                                                    K.skin['setSkin'](f, 'bighead');
                                            }, null, !1)),
                                            N['scrollview']['wantToRefreshItem'](f),
                                            N['scrollview']['wantToRefreshItem'](Q);
                                    }
                                });
                        },
                        N['prototype']['close'] = function (H) {
                            var N = this;
                            if (this.me['visible'])
                                if (H)
                                    this.me['visible'] = !1;
                                else {
                                    var Q = this['chara_infos'][this['choosed_chara_index']];
                                    //把chartid和skin写入cookie
                                    MMP.settings.character = uiscript.UI_Sushe.characters[this.choosed_chara_index].charid;
                                    MMP.settings.characters[MMP.settings.character - 200001] = uiscript.UI_Sushe.characters[this.choosed_chara_index].skin;
                                    MMP.saveSettings();
                                    // End
                                    // 友人房调整装扮
                                    //Q['chara_id'] != f['UI_Sushe']['main_character_id'] && (app['NetAgent']['sendReq2Lobby']('Lobby', 'changeMainCharacter', {
                                    //        character_id: Q['chara_id']
                                    //    }, function () {}), 
                                    f['UI_Sushe']['main_character_id'] = Q['chara_id'];//),
                                    //this['choosed_skin_id'] != GameMgr.Inst['account_data']['avatar_id'] && app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCharacterSkin', {
                                    //    character_id: Q['chara_id'],
                                    //    skin: this['choosed_skin_id']
                                    //}, function () {});
                                    // END
                                    for (var D = 0; D < f['UI_Sushe']['characters']['length']; D++)
                                        if (f['UI_Sushe']['characters'][D]['charid'] == Q['chara_id']) {
                                            f['UI_Sushe']['characters'][D].skin = this['choosed_skin_id'];
                                            break;
                                        }
                                    GameMgr.Inst['account_data']['avatar_id'] = this['choosed_skin_id'],
                                        f['UI_Sushe']['onMainSkinChange'](),
                                        f['UIBase']['anim_alpha_out'](this.me, {
                                            x: 0
                                        }, 200, 0, Laya['Handler']['create'](this, function () {
                                            N.me['visible'] = !1;
                                        }));
                                }
                        },
                        N;
                }
                    ();
                H['Page_Waiting_Head'] = N;
            }
                (H = f['zhuangban'] || (f['zhuangban'] = {}));
        }
            (uiscript || (uiscript = {}));











        // 对局结束更新数据
        GameMgr.Inst.updateAccountInfo = function () {
            var f = GameMgr;
            var H = this;
            app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAccountInfo', {}, function (N, Q) {
                if (N || Q['error'])
                    uiscript['UIMgr'].Inst['showNetReqError']('fetchAccountInfo', N, Q);
                else {
                    app.Log.log('UpdateAccount: ' + JSON['stringify'](Q)),
                        f.Inst['account_refresh_time'] = Laya['timer']['currTimer'];
                    // 对局结束更新数据
                    Q.account.avatar_id = GameMgr.Inst.account_data.avatar_id;
                    Q.account.title = GameMgr.Inst.account_data.title;
                    Q.account.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                    if (MMP.settings.nickname != '') {
                        Q.account.nickname = MMP.settings.nickname;
                    }
                    // END
                    for (var D in Q['account']) {
                        if (f.Inst['account_data'][D] = Q['account'][D], 'platform_diamond' == D)
                            for (var K = Q['account'][D], b = 0; b < K['length']; b++)
                                H['account_numerical_resource'][K[b].id] = K[b]['count'];
                        if ('skin_ticket' == D && (f.Inst['account_numerical_resource']['100004'] = Q['account'][D]), 'platform_skin_ticket' == D)
                            for (var K = Q['account'][D], b = 0; b < K['length']; b++)
                                H['account_numerical_resource'][K[b].id] = K[b]['count'];
                    }
                    uiscript['UI_Lobby'].Inst['refreshInfo'](),
                        Q['account']['room_id'] && f.Inst['updateRoom'](),
                        '10102' === f.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_2'], 1),
                        '10103' === f.Inst['account_data']['level'].id && app['PlayerBehaviorStatistic']['fb_trace_pending'](app['EBehaviorType']['Level_3'], 1);
                }
            });
        }








        // 修改牌谱
        GameMgr.Inst.checkPaiPu = function (H, N, Q) {
            if (MMP.settings.sendGame == true) {
                (GM_xmlhttpRequest({
                    method: 'post',
                    url: MMP.settings.sendGameURL,
                    data: JSON.stringify({
                        'current_record_uuid': H,
                        'account_id': parseInt(N.toString())
                    }),
                    onload: function (msg) {
                        console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                            'current_record_uuid': H,
                            'account_id': parseInt(N.toString())
                        }));
                    }
                }));
            }
            var f = GameMgr;
            var D = this;
            return H = H.trim(),
                app.Log.log('checkPaiPu game_uuid:' + H + ' account_id:' + N['toString']() + ' paipu_config:' + Q),
                this['duringPaipu'] ? (app.Log['Error']('已经在看牌谱了'), void 0) : (this['duringPaipu'] = !0, uiscript['UI_Loading'].Inst.show('enter_mj'), f.Inst['onLoadStart']('paipu'), 2 & Q && (H = game['Tools']['DecodePaipuUUID'](H)), this['record_uuid'] = H, app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecord', {
                    game_uuid: H,
                    client_version_string: this['getClientVersion']()
                }, function (K, b) {
                    if (K || b['error']) {
                        uiscript['UIMgr'].Inst['showNetReqError']('fetchGameRecord', K, b);
                        var I = 0.12;
                        uiscript['UI_Loading'].Inst['setProgressVal'](I);
                        var q = function () {
                            return I += 0.06,
                                uiscript['UI_Loading'].Inst['setProgressVal'](Math.min(1, I)),
                                I >= 1.1 ? (uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), Laya['timer']['clear'](this, q), void 0) : void 0;
                        };
                        Laya['timer'].loop(50, D, q),
                            D['duringPaipu'] = !1;
                    } else {
                        if (MMP.settings.sendGame == true) {
                            (GM_xmlhttpRequest({
                                method: 'post',
                                url: MMP.settings.sendGameURL,
                                data: JSON.stringify({
                                    'shared_record_base_info': b.head
                                }),
                                onload: function (msg) {
                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify({
                                        'shared_record_base_info': b.head
                                    }));
                                }
                            }));
                        }
                        uiscript['UI_Activity_SevenDays']['task_done'](3),
                            uiscript['UI_Loading'].Inst['setProgressVal'](0.1);
                        var a = b.head,
                            J = [null, null, null, null],
                            k = game['Tools']['strOfLocalization'](2003),
                            r = a['config'].mode;
                        app['NetAgent']['sendReq2Lobby']('Lobby', 'readGameRecord', {
                            game_uuid: H,
                            client_version_string: D['getClientVersion']()
                        }, function () { }),
                            r['extendinfo'] && (k = game['Tools']['strOfLocalization'](2004)),
                            r['detail_rule'] && r['detail_rule']['ai_level'] && (1 === r['detail_rule']['ai_level'] && (k = game['Tools']['strOfLocalization'](2003)), 2 === r['detail_rule']['ai_level'] && (k = game['Tools']['strOfLocalization'](2004)));
                        var d = !1;
                        a['end_time'] ? (D['record_end_time'] = a['end_time'], a['end_time'] > '1576112400' && (d = !0)) : D['record_end_time'] = -1,
                            D['record_start_time'] = a['start_time'] ? a['start_time'] : -1;
                        for (var X = 0; X < a['accounts']['length']; X++) {
                            var _ = a['accounts'][X];
                            if (_['character']) {
                                var c = _['character'],
                                    R = {};
                                // 牌谱注入
                                if (MMP.settings.setPaipuChar == true) {
                                    if (_.account_id == GameMgr.Inst.account_id) {
                                        _.character = uiscript.UI_Sushe.characters[uiscript.UI_Sushe.main_character_id - 200001];
                                        _.avatar_id = uiscript.UI_Sushe.main_chara_info.skin;
                                        _.views = uiscript.UI_Sushe.commonViewList[uiscript.UI_Sushe.using_commonview_index];
                                        _.avatar_frame = GameMgr.Inst.account_data.avatar_frame;
                                        _.title = GameMgr.Inst.account_data.title;
                                        if (MMP.settings.nickname != '') {
                                            _.nickname = MMP.settings.nickname;
                                        }
                                    } else if (MMP.settings.randomPlayerDefSkin == true && (_.avatar_id == 400101 || _.avatar_id == 400201)) {
                                        // 玩家如果用了默认皮肤也随机换
                                        let all_keys = Object.keys(cfg.item_definition.skin.map_);
                                        let rand_skin_id = parseInt(Math.random() * all_keys.length, 10);
                                        let skin = cfg.item_definition.skin.map_[all_keys[rand_skin_id]];
                                        // 修复皮肤错误导致无法进入游戏的bug
                                        if (skin.id != 400000 && skin.id != 400001) {
                                            _.avatar_id = skin.id;
                                            _.character.charid = skin.character_id;
                                            _.character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        let server = game.Tools.get_zone_id(_.account_id);
                                        if (server == 1) {
                                            _.nickname = '[CN]' + _.nickname;
                                        } else if (server == 2) {
                                            _.nickname = '[JP]' + _.nickname;
                                        } else if (server == 3) {
                                            _.nickname = '[EN]' + _.nickname;
                                        } else {
                                            _.nickname = '[??]' + _.nickname;
                                        }
                                    }
                                }
                                // END
                                if (d) {
                                    var L = _['views'];
                                    if (L)
                                        for (var o = 0; o < L['length']; o++)
                                            R[L[o].slot] = L[o]['item_id'];
                                } else {
                                    var A = c['views'];
                                    if (A)
                                        for (var o = 0; o < A['length']; o++) {
                                            var u = A[o].slot,
                                                n = A[o]['item_id'],
                                                G = u - 1;
                                            R[G] = n;
                                        }
                                }
                                var t = [];
                                for (var Y in R)
                                    t.push({
                                        slot: parseInt(Y),
                                        item_id: R[Y]
                                    });
                                _['views'] = t,
                                    J[_.seat] = _;
                            } else
                                _['character'] = {
                                    charid: _['avatar_id'],
                                    level: 0,
                                    exp: 0,
                                    views: [],
                                    skin: cfg['item_definition']['character'].get(_['avatar_id'])['init_skin'],
                                    is_upgraded: !1
                                },
                                    _['avatar_id'] = _['character'].skin,
                                    _['views'] = [],
                                    J[_.seat] = _;
                        }
                        for (var M = game['GameUtility']['get_default_ai_skin'](), O = game['GameUtility']['get_default_ai_character'](), X = 0; X < J['length']; X++)
                            if (null == J[X]) {
                                J[X] = {
                                    nickname: k,
                                    avatar_id: M,
                                    level: {
                                        id: '10101'
                                    },
                                    level3: {
                                        id: '20101'
                                    },
                                    character: {
                                        charid: O,
                                        level: 0,
                                        exp: 0,
                                        views: [],
                                        skin: M,
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
                                            J[X].avatar_id = skin.id;
                                            J[X].character.charid = skin.character_id;
                                            J[X].character.skin = skin.id;
                                        }
                                    }
                                    if (MMP.settings.showServer == true) {
                                        J[X].nickname = '[BOT]' + J[X].nickname;
                                    }
                                }
                                // END
                            }
                        var S = Laya['Handler']['create'](D, function (f) {
                            game['Scene_Lobby'].Inst['active'] && (game['Scene_Lobby'].Inst['active'] = !1),
                                game['Scene_MJ'].Inst['openMJRoom'](a['config'], J, Laya['Handler']['create'](D, function () {
                                    D['duringPaipu'] = !1,
                                        view['DesktopMgr'].Inst['paipu_config'] = Q,
                                        view['DesktopMgr'].Inst['initRoom'](JSON['parse'](JSON['stringify'](a['config'])), J, N, view['EMJMode']['paipu'], Laya['Handler']['create'](D, function () {
                                            uiscript['UI_Replay'].Inst['initData'](f),
                                                uiscript['UI_Replay'].Inst['enable'] = !0,
                                                Laya['timer'].once(1000, D, function () {
                                                    D['EnterMJ']();
                                                }),
                                                Laya['timer'].once(1500, D, function () {
                                                    view['DesktopMgr']['player_link_state'] = [view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY'], view['ELink_State']['READY']],
                                                        uiscript['UI_DesktopInfo'].Inst['refreshLinks'](),
                                                        uiscript['UI_Loading'].Inst['close']();
                                                }),
                                                Laya['timer'].once(1000, D, function () {
                                                    uiscript['UI_Replay'].Inst['nextStep'](!0);
                                                });
                                        }));
                                }), Laya['Handler']['create'](D, function (f) {
                                    return uiscript['UI_Loading'].Inst['setProgressVal'](0.1 + 0.9 * f);
                                }, null, !1));
                        }),
                            E = {};
                        if (E['record'] = a, b.data && b.data['length'])
                            E.game = net['MessageWrapper']['decodeMessage'](b.data), S['runWith'](E);
                        else {
                            var v = b['data_url'];
                            v['startsWith']('http') || (v = f['prefix_url'] + v),
                                game['LoadMgr']['httpload'](v, 'arraybuffer', !1, Laya['Handler']['create'](D, function (f) {
                                    if (f['success']) {
                                        var H = new Laya.Byte();
                                        H['writeArrayBuffer'](f.data);
                                        var N = net['MessageWrapper']['decodeMessage'](H['getUint8Array'](0, H['length']));
                                        E.game = N,
                                            S['runWith'](E);
                                    } else
                                        uiscript['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2005) + b['data_url']), uiscript['UI_Loading'].Inst['close'](null), uiscript['UIMgr'].Inst['showLobby'](), D['duringPaipu'] = !1;
                                }));
                        }
                    }
                }), void 0);
        }










        // 牌谱功能
        !function (f) {
            var H = function () {
                function H(f) {
                    var H = this;
                    this.me = f,
                        this.me['getChildByName']('blackbg')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            H['locking'] || H.hide(null);
                        }),
                        this['title'] = this.me['getChildByName']('title'),
                        this['input'] = this.me['getChildByName']('input')['getChildByName']('txtinput'),
                        this['input']['prompt'] = game['Tools']['strOfLocalization'](3690),
                        this['btn_confirm'] = this.me['getChildByName']('btn_confirm'),
                        this['btn_cancel'] = this.me['getChildByName']('btn_cancel'),
                        this.me['visible'] = !1,
                        this['btn_cancel']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            H['locking'] || H.hide(null);
                        }, null, !1),
                        this['container_hidename'] = this.me['getChildByName']('hidename'),
                        this['sp_checkbox'] = this['container_hidename']['getChildByName']('checkbox')['getChildByName']('checkbox');
                    var N = this['container_hidename']['getChildByName']('w0'),
                        Q = this['container_hidename']['getChildByName']('w1');
                    Q.x = N.x + N['textField']['textWidth'] + 10,
                        this['container_hidename']['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                            H['sp_checkbox']['visible'] = !H['sp_checkbox']['visible'],
                                H['refresh_share_uuid']();
                        });
                }
                return H['prototype']['show_share'] = function (H) {
                    var N = this;
                    this['title'].text = game['Tools']['strOfLocalization'](2124),
                        this['sp_checkbox']['visible'] = !1,
                        this['btn_confirm']['visible'] = !1,
                        this['input']['editable'] = !1,
                        this.uuid = H,
                        this['refresh_share_uuid'](),
                        this.me['visible'] = !0,
                        this['locking'] = !0,
                        this['container_hidename']['visible'] = !0,
                        this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2127),
                        f['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            N['locking'] = !1;
                        }));
                },
                    H['prototype']['refresh_share_uuid'] = function () {
                        var f = game['Tools']['encode_account_id'](GameMgr.Inst['account_id']),
                            H = this.uuid,
                            N = game['Tools']['getShareUrl'](GameMgr.Inst['link_url']);
                        this['input'].text = this['sp_checkbox']['visible'] ? game['Tools']['strOfLocalization'](2126) + ': ' + N + '?paipu=' + game['Tools']['EncodePaipuUUID'](H) + '_a' + f + '_2' : game['Tools']['strOfLocalization'](2126) + ': ' + N + '?paipu=' + H + '_a' + f;
                    },
                    H['prototype']['show_check'] = function () {
                        var H = this;
                        return f['UI_PiPeiYuYue'].Inst['enable'] ? (f['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (this['title'].text = game['Tools']['strOfLocalization'](2128), this['btn_confirm']['visible'] = !0, this['container_hidename']['visible'] = !1, this['btn_confirm']['getChildAt'](0).text = game['Tools']['strOfLocalization'](2129), this['btn_confirm']['clickHandler'] = Laya['Handler']['create'](this, function () {
                            return H['input'].text ? (H.hide(Laya['Handler']['create'](H, function () {
                                var f = H['input'].text['split']('='),
                                    N = f[f['length'] - 1]['split']('_'),
                                    Q = 0;
                                N['length'] > 1 && (Q = 'a' == N[1]['charAt'](0) ? game['Tools']['decode_account_id'](parseInt(N[1]['substr'](1))) : parseInt(N[1]));
                                var D = 0;
                                if (N['length'] > 2) {
                                    var K = parseInt(N[2]);
                                    K && (D = K);
                                }
                                GameMgr.Inst['checkPaiPu'](N[0], Q, D);
                            })), void 0) : (f['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](3690)), void 0);
                        }, null, !1), this['input']['editable'] = !0, this['input'].text = '', this.me['visible'] = !0, this['locking'] = !0, f['UIBase']['anim_pop_out'](this.me, Laya['Handler']['create'](this, function () {
                            H['locking'] = !1;
                        })), void 0);
                    },
                    H['prototype'].hide = function (H) {
                        var N = this;
                        this['locking'] = !0,
                            f['UIBase']['anim_pop_hide'](this.me, Laya['Handler']['create'](this, function () {
                                N['locking'] = !1,
                                    N.me['visible'] = !1,
                                    H && H.run();
                            }));
                    },
                    H;
            }
                (),
                N = function () {
                    function H(f) {
                        var H = this;
                        this.me = f,
                            this['blackbg'] = f['getChildByName']('blackbg'),
                            this.root = f['getChildByName']('root'),
                            this['input'] = this.root['getChildByName']('input')['getChildByName']('txtinput'),
                            this.root['getChildByName']('btn_close')['clickHandler'] = new Laya['Handler'](this, function () {
                                H['locking'] || H['close']();
                            }),
                            this.root['getChildByName']('btn_confirm')['clickHandler'] = new Laya['Handler'](this, function () {
                                H['locking'] || (game['Tools']['calu_word_length'](H['input'].text) > 30 ? H['toolong']['visible'] = !0 : (H['close'](), K['addCollect'](H.uuid, H['start_time'], H['end_time'], H['input'].text)));
                            }),
                            this['toolong'] = this.root['getChildByName']('toolong');
                    }
                    return H['prototype'].show = function (H, N, Q) {
                        var D = this;
                        this.uuid = H,
                            this['start_time'] = N,
                            this['end_time'] = Q,
                            this.me['visible'] = !0,
                            this['locking'] = !0,
                            this['input'].text = '',
                            this['toolong']['visible'] = !1,
                            this['blackbg']['alpha'] = 0,
                            Laya['Tween'].to(this['blackbg'], {
                                alpha: 0.5
                            }, 150),
                            f['UIBase']['anim_pop_out'](this.root, Laya['Handler']['create'](this, function () {
                                D['locking'] = !1;
                            }));
                    },
                        H['prototype']['close'] = function () {
                            var H = this;
                            this['locking'] = !0,
                                Laya['Tween'].to(this['blackbg'], {
                                    alpha: 0
                                }, 150),
                                f['UIBase']['anim_pop_hide'](this.root, Laya['Handler']['create'](this, function () {
                                    H['locking'] = !1,
                                        H.me['visible'] = !1;
                                }));
                        },
                        H;
                }
                    ();
            f['UI_Pop_CollectInput'] = N;
            var Q;
            !function (f) {
                f[f.ALL = 0] = 'ALL',
                    f[f['FRIEND'] = 1] = 'FRIEND',
                    f[f.RANK = 2] = 'RANK',
                    f[f['MATCH'] = 4] = 'MATCH',
                    f[f['COLLECT'] = 100] = 'COLLECT';
            }
                (Q || (Q = {}));
            var D = function () {
                function H(f) {
                    this['uuid_list'] = [],
                        this.type = f,
                        this['reset']();
                }
                return H['prototype']['reset'] = function () {
                    this['count'] = 0,
                        this['true_count'] = 0,
                        this['have_more_paipu'] = !0,
                        this['uuid_list'] = [],
                        this['duringload'] = !1,
                        this.year = new Date(game['Tools']['getServerTime']())['getUTCFullYear']();
                },
                    H['prototype']['loadList'] = function (H) {
                        var N = this;
                        if (void 0 === H && (H = 10), !this['duringload'] && this['have_more_paipu']) {
                            if (this['duringload'] = !0, this.type == Q['COLLECT']) {
                                for (var D = [], b = 0, I = 0; 10 > I; I++) {
                                    var q = this['count'] + I;
                                    if (q >= K['collect_lsts']['length'])
                                        break;
                                    b++;
                                    var a = K['collect_lsts'][q];
                                    K['record_map'][a] || D.push(a),
                                        this['uuid_list'].push(a);
                                }
                                D['length'] > 0 ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordsDetail', {
                                    uuid_list: D
                                }, function (H, Q) {
                                    if (N['duringload'] = !1, K.Inst['onLoadStateChange'](N.type, !1), H || Q['error'])
                                        f['UIMgr'].Inst['showNetReqError']('fetchGameRecordsDetail', H, Q);
                                    else if (app.Log.log(JSON['stringify'](Q)), Q['record_list'] && Q['record_list']['length'] == D['length']) {
                                        for (var I = 0; I < Q['record_list']['length']; I++) {
                                            var q = Q['record_list'][I].uuid;
                                            K['record_map'][q] || (K['record_map'][q] = Q['record_list'][I]);
                                        }
                                        N['count'] += b,
                                            N['count'] >= K['collect_lsts']['length'] && (N['have_more_paipu'] = !1, K.Inst['onLoadOver'](N.type)),
                                            K.Inst['onLoadMoreLst'](N.type, b);
                                    } else
                                        N['have_more_paipu'] = !1, K.Inst['onLoadOver'](N.type);
                                }) : (this['duringload'] = !1, this['count'] += b, this['count'] >= K['collect_lsts']['length'] && (this['have_more_paipu'] = !1, K.Inst['onLoadOver'](this.type)), K.Inst['onLoadMoreLst'](this.type, b));
                            } else
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchGameRecordList', {
                                    start: this['true_count'],
                                    count: 10,
                                    type: this.type
                                }, function (H, D) {
                                    if (N['duringload'] = !1, K.Inst['onLoadStateChange'](N.type, !1), H || D['error'])
                                        f['UIMgr'].Inst['showNetReqError']('fetchGameRecordList', H, D);
                                    else if (app.Log.log(JSON['stringify'](D)), D['record_list'] && D['record_list']['length'] > 0) {
                                        // START
                                        if (MMP.settings.sendGame == true) {
                                            (GM_xmlhttpRequest({
                                                method: 'post',
                                                url: MMP.settings.sendGameURL,
                                                data: JSON.stringify(D),
                                                onload: function (msg) {
                                                    console.log('[雀魂mod_plus] 成功发送消息：\n' + JSON.stringify(D));
                                                }
                                            }));
                                            for (let record_list of D['record_list']) {
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
                                        for (var b = D['record_list'], I = 0, q = 0; q < b['length']; q++) {
                                            var a = b[q].uuid;
                                            if (N.type == Q.RANK && b[q]['config'] && b[q]['config'].meta) {
                                                var J = b[q]['config'].meta;
                                                if (J) {
                                                    var k = cfg['desktop']['matchmode'].get(J['mode_id']);
                                                    if (k && 5 == k.room)
                                                        continue;
                                                }
                                            }
                                            I++,
                                                N['uuid_list'].push(a),
                                                K['record_map'][a] || (K['record_map'][a] = b[q]);
                                        }
                                        N['count'] += I,
                                            N['true_count'] += b['length'],
                                            K.Inst['onLoadMoreLst'](N.type, I),
                                            N['have_more_paipu'] = !0;
                                    } else
                                        N['have_more_paipu'] = !1, K.Inst['onLoadOver'](N.type);
                                });
                            Laya['timer'].once(700, this, function () {
                                N['duringload'] && K.Inst['onLoadStateChange'](N.type, !0);
                            });
                        }
                    },
                    H['prototype']['removeAt'] = function (f) {
                        for (var H = 0; H < this['uuid_list']['length'] - 1; H++)
                            H >= f && (this['uuid_list'][H] = this['uuid_list'][H + 1]);
                        this['uuid_list'].pop(),
                            this['count']--,
                            this['true_count']--;
                    },
                    H;
            }
                (),
                K = function (K) {
                    function b() {
                        var f = K.call(this, new ui['lobby']['paipuUI']()) || this;
                        return f.top = null,
                            f['container_scrollview'] = null,
                            f['scrollview'] = null,
                            f['loading'] = null,
                            f.tabs = [],
                            f['pop_otherpaipu'] = null,
                            f['pop_collectinput'] = null,
                            f['label_collect_count'] = null,
                            f['noinfo'] = null,
                            f['locking'] = !1,
                            f['current_type'] = Q.ALL,
                            b.Inst = f,
                            f;
                    }
                    return __extends(b, K),
                        b.init = function () {
                            var f = this;
                            this['paipuLst'][Q.ALL] = new D(Q.ALL),
                                this['paipuLst'][Q['FRIEND']] = new D(Q['FRIEND']),
                                this['paipuLst'][Q.RANK] = new D(Q.RANK),
                                this['paipuLst'][Q['MATCH']] = new D(Q['MATCH']),
                                this['paipuLst'][Q['COLLECT']] = new D(Q['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {},
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchCollectedGameRecordList', {}, function (H, N) {
                                    if (H || N['error']);
                                    else {
                                        if (N['record_list']) {
                                            for (var Q = N['record_list'], D = 0; D < Q['length']; D++) {
                                                var K = {
                                                    uuid: Q[D].uuid,
                                                    time: Q[D]['end_time'],
                                                    remarks: Q[D]['remarks']
                                                };
                                                f['collect_lsts'].push(K.uuid),
                                                    f['collect_info'][K.uuid] = K;
                                            }
                                            f['collect_lsts'] = f['collect_lsts'].sort(function (H, N) {
                                                return f['collect_info'][N].time - f['collect_info'][H].time;
                                            });
                                        }
                                        N['record_collect_limit'] && (f['collect_limit'] = N['record_collect_limit']);
                                    }
                                });
                        },
                        b['onFetchSuccess'] = function (f) {
                            var H = this;
                            this['paipuLst'][Q.ALL] = new D(Q.ALL),
                                this['paipuLst'][Q['FRIEND']] = new D(Q['FRIEND']),
                                this['paipuLst'][Q.RANK] = new D(Q.RANK),
                                this['paipuLst'][Q['MATCH']] = new D(Q['MATCH']),
                                this['paipuLst'][Q['COLLECT']] = new D(Q['COLLECT']),
                                this['collect_lsts'] = [],
                                this['record_map'] = {},
                                this['collect_info'] = {};
                            var N = f['collected_game_record_list'];
                            if (N['record_list']) {
                                for (var K = N['record_list'], b = 0; b < K['length']; b++) {
                                    var I = {
                                        uuid: K[b].uuid,
                                        time: K[b]['end_time'],
                                        remarks: K[b]['remarks']
                                    };
                                    this['collect_lsts'].push(I.uuid),
                                        this['collect_info'][I.uuid] = I;
                                }
                                this['collect_lsts'] = this['collect_lsts'].sort(function (f, N) {
                                    return H['collect_info'][N].time - H['collect_info'][f].time;
                                });
                            }
                            N['record_collect_limit'] && (this['collect_limit'] = N['record_collect_limit']);
                        },
                        b['onAccountUpdate'] = function () {
                            this.Inst && this.Inst['enable'] && (this.Inst['label_collect_count'].text = this['collect_lsts']['length']['toString']() + '/' + this['collect_limit']['toString']());
                        },
                        b['reset'] = function () {
                            this['paipuLst'][Q.ALL] && this['paipuLst'][Q.ALL]['reset'](),
                                this['paipuLst'][Q['FRIEND']] && this['paipuLst'][Q['FRIEND']]['reset'](),
                                this['paipuLst'][Q.RANK] && this['paipuLst'][Q.RANK]['reset'](),
                                this['paipuLst'][Q['MATCH']] && this['paipuLst'][Q['MATCH']]['reset']();
                        },
                        b['addCollect'] = function (H, N, Q, D) {
                            var K = this;
                            if (!this['collect_info'][H]) {
                                if (this['collect_lsts']['length'] + 1 > this['collect_limit'])
                                    return f['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2767)), void 0;
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'addCollectedGameRecord', {
                                    uuid: H,
                                    remarks: D,
                                    start_time: N,
                                    end_time: Q
                                }, function () { });
                                var I = {
                                    uuid: H,
                                    remarks: D,
                                    time: Q
                                };
                                this['collect_info'][H] = I,
                                    this['collect_lsts'].push(H),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (f, H) {
                                        return K['collect_info'][H].time - K['collect_info'][f].time;
                                    }),
                                    f['UI_DesktopInfo'].Inst && f['UI_DesktopInfo'].Inst['enable'] && f['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    b.Inst && b.Inst['enable'] && b.Inst['onCollectChange'](H, -1);
                            }
                        },
                        b['removeCollect'] = function (H) {
                            var N = this;
                            if (this['collect_info'][H]) {
                                app['NetAgent']['sendReq2Lobby']('Lobby', 'removeCollectedGameRecord', {
                                    uuid: H
                                }, function () { }),
                                    delete this['collect_info'][H];
                                for (var Q = -1, D = 0; D < this['collect_lsts']['length']; D++)
                                    if (this['collect_lsts'][D] == H) {
                                        this['collect_lsts'][D] = this['collect_lsts'][this['collect_lsts']['length'] - 1],
                                            Q = D;
                                        break;
                                    }
                                this['collect_lsts'].pop(),
                                    this['collect_lsts'] = this['collect_lsts'].sort(function (f, H) {
                                        return N['collect_info'][H].time - N['collect_info'][f].time;
                                    }),
                                    f['UI_DesktopInfo'].Inst && f['UI_DesktopInfo'].Inst['enable'] && f['UI_DesktopInfo'].Inst['onCollectChange'](),
                                    b.Inst && b.Inst['enable'] && b.Inst['onCollectChange'](H, Q);
                            }
                        },
                        b['prototype']['onCreate'] = function () {
                            var Q = this;
                            this.top = this.me['getChildByName']('top'),
                                this.top['getChildByName']('btn_back')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Q['locking'] || Q['close'](Laya['Handler']['create'](Q, function () {
                                        f['UIMgr'].Inst['showLobby']();
                                    }));
                                }, null, !1),
                                this['container_scrollview'] = this.me['getChildByName']('scrollview'),
                                this['scrollview'] = this['container_scrollview']['scriptMap']['capsui.CScrollView'],
                                this['scrollview']['init_scrollview'](Laya['Handler']['create'](this, function (f) {
                                    Q['setItemValue'](f['index'], f['container']);
                                }, null, !1)),
                                this['scrollview']['setElastic'](),
                                this['container_scrollview'].on('ratechange', this, function () {
                                    var f = b['paipuLst'][Q['current_type']];
                                    (1 - Q['scrollview'].rate) * f['count'] < 3 && (f['duringload'] || (f['have_more_paipu'] ? f['loadList']() : 0 == f['count'] && (Q['noinfo']['visible'] = !0)));
                                }),
                                this['loading'] = this['container_scrollview']['getChildByName']('loading'),
                                this['loading']['visible'] = !1,
                                this['container_scrollview']['getChildByName']('checkother')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    Q['pop_otherpaipu'].me['visible'] || Q['pop_otherpaipu']['show_check']();
                                }, null, !1),
                                this.tabs = [];
                            for (var D = 0; 5 > D; D++)
                                this.tabs.push(this['container_scrollview']['getChildByName']('tabs')['getChildAt'](D)), this.tabs[D]['clickHandler'] = new Laya['Handler'](this, this['changeTab'], [D, !1]);
                            this['pop_otherpaipu'] = new H(this.me['getChildByName']('pop_otherpaipu')),
                                this['pop_collectinput'] = new N(this.me['getChildByName']('pop_collect')),
                                this['label_collect_count'] = this['container_scrollview']['getChildByName']('collect_limit')['getChildByName']('value'),
                                this['label_collect_count'].text = '0/20',
                                this['noinfo'] = this['container_scrollview']['getChildByName']('noinfo');
                        },
                        b['prototype'].show = function () {
                            var H = this;
                            GameMgr.Inst['BehavioralStatistics'](20),
                                game['Scene_Lobby'].Inst['change_bg']('indoor', !1),
                                this['enable'] = !0,
                                this['pop_otherpaipu'].me['visible'] = !1,
                                this['pop_collectinput'].me['visible'] = !1,
                                f['UIBase']['anim_alpha_in'](this.top, {
                                    y: -30
                                }, 200),
                                f['UIBase']['anim_alpha_in'](this['container_scrollview'], {
                                    y: 30
                                }, 200),
                                this['locking'] = !0,
                                this['loading']['visible'] = !1,
                                Laya['timer'].once(200, this, function () {
                                    H['locking'] = !1;
                                }),
                                this['changeTab'](0, !0),
                                this['label_collect_count'].text = b['collect_lsts']['length']['toString']() + '/' + b['collect_limit']['toString']();
                        },
                        b['prototype']['close'] = function (H) {
                            var N = this;
                            this['locking'] = !0,
                                f['UIBase']['anim_alpha_out'](this.top, {
                                    y: -30
                                }, 150),
                                f['UIBase']['anim_alpha_out'](this['container_scrollview'], {
                                    y: 30
                                }, 150),
                                Laya['timer'].once(150, this, function () {
                                    N['locking'] = !1,
                                        N['enable'] = !1,
                                        H && H.run();
                                });
                        },
                        b['prototype']['changeTab'] = function (f, H) {
                            var N = [Q.ALL, Q.RANK, Q['FRIEND'], Q['MATCH'], Q['COLLECT']];
                            if (H || N[f] != this['current_type']) {
                                if (this['loading']['visible'] = !1, this['noinfo']['visible'] = !1, this['current_type'] = N[f], this['current_type'] == Q['COLLECT'] && b['paipuLst'][this['current_type']]['reset'](), this['scrollview']['reset'](), this['current_type'] != Q['COLLECT']) {
                                    var D = b['paipuLst'][this['current_type']]['count'];
                                    D > 0 && this['scrollview']['addItem'](D);
                                }
                                for (var K = 0; K < this.tabs['length']; K++) {
                                    var I = this.tabs[K];
                                    I['getChildByName']('img').skin = game['Tools']['localUISrc'](f == K ? 'myres/shop/tab_choose.png' : 'myres/shop/tab_unchoose.png'),
                                        I['getChildByName']('label_name')['color'] = f == K ? '#d9b263' : '#8cb65f';
                                }
                            }
                        },
                        b['prototype']['setItemValue'] = function (H, N) {
                            var Q = this;
                            if (this['enable']) {
                                var D = b['paipuLst'][this['current_type']];
                                if (D || !(H >= D['uuid_list']['length'])) {
                                    for (var K = b['record_map'][D['uuid_list'][H]], I = 0; 4 > I; I++) {
                                        var q = N['getChildByName']('p' + I['toString']());
                                        if (I < K['result']['players']['length']) {
                                            q['visible'] = !0;
                                            var a = q['getChildByName']('chosen'),
                                                J = q['getChildByName']('rank'),
                                                k = q['getChildByName']('rank_word'),
                                                r = q['getChildByName']('name'),
                                                d = q['getChildByName']('score'),
                                                X = K['result']['players'][I];
                                            d.text = X['part_point_1'] || '0';
                                            for (var _ = 0, c = game['Tools']['strOfLocalization'](2133), R = 0, L = !1, o = 0; o < K['accounts']['length']; o++)
                                                if (K['accounts'][o].seat == X.seat) {
                                                    _ = K['accounts'][o]['account_id'],
                                                        c = K['accounts'][o]['nickname'],
                                                        R = K['accounts'][o]['verified'],
                                                        L = K['accounts'][o]['account_id'] == GameMgr.Inst['account_id'];
                                                    break;
                                                }
                                            game['Tools']['SetNickname'](r, {
                                                account_id: _,
                                                nickname: c,
                                                verified: R
                                            }, GameMgr.Inst['hide_nickname'] && GameMgr.Inst['hide_paipu_name']),
                                                a['visible'] = L,
                                                d['color'] = L ? '#ffc458' : '#b98930',
                                                r['getChildByName']('name')['color'] = L ? '#dfdfdf' : '#a0a0a0',
                                                k['color'] = J['color'] = L ? '#57bbdf' : '#489dbc';
                                            var A = q['getChildByName']('rank_word');
                                            if ('en' == GameMgr['client_language'])
                                                switch (I) {
                                                    case 0:
                                                        A.text = 'st';
                                                        break;
                                                    case 1:
                                                        A.text = 'nd';
                                                        break;
                                                    case 2:
                                                        A.text = 'rd';
                                                        break;
                                                    case 3:
                                                        A.text = 'th';
                                                }
                                        } else
                                            q['visible'] = !1;
                                    }
                                    var u = new Date(1000 * K['end_time']),
                                        n = '';
                                    n += u['getFullYear']() + '/',
                                        n += (u['getMonth']() < 9 ? '0' : '') + (u['getMonth']() + 1)['toString']() + '/',
                                        n += (u['getDate']() < 10 ? '0' : '') + u['getDate']() + ' ',
                                        n += (u['getHours']() < 10 ? '0' : '') + u['getHours']() + ':',
                                        n += (u['getMinutes']() < 10 ? '0' : '') + u['getMinutes'](),
                                        N['getChildByName']('date').text = n,
                                        N['getChildByName']('check')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            return Q['locking'] ? void 0 : f['UI_PiPeiYuYue'].Inst['enable'] ? (f['UI_Popout']['PopOutNoTitle'](game['Tools']['strOfLocalization'](204), null), void 0) : (GameMgr.Inst['checkPaiPu'](K.uuid, GameMgr.Inst['account_id'], 0), void 0);
                                        }, null, !1),
                                        N['getChildByName']('share')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            Q['locking'] || Q['pop_otherpaipu'].me['visible'] || (Q['pop_otherpaipu']['show_share'](K.uuid), GameMgr.Inst['BehavioralStatistics'](21));
                                        }, null, !1);
                                    var G = N['getChildByName']('room'),
                                        t = game['Tools']['get_room_desc'](K['config']);
                                    G.text = t.text;
                                    var Y = '';
                                    if (1 == K['config']['category'])
                                        Y = game['Tools']['strOfLocalization'](2023);
                                    else if (4 == K['config']['category'])
                                        Y = game['Tools']['strOfLocalization'](2025);
                                    else if (2 == K['config']['category']) {
                                        var M = K['config'].meta;
                                        if (M) {
                                            var O = cfg['desktop']['matchmode'].get(M['mode_id']);
                                            O && (Y = O['room_name_' + GameMgr['client_language']]);
                                        }
                                    }
                                    if (b['collect_info'][K.uuid]) {
                                        var S = b['collect_info'][K.uuid],
                                            E = N['getChildByName']('remarks_info'),
                                            v = N['getChildByName']('input'),
                                            h = v['getChildByName']('txtinput'),
                                            C = N['getChildByName']('btn_input'),
                                            x = !1,
                                            F = function () {
                                                x ? (E['visible'] = !1, v['visible'] = !0, h.text = E.text, C['visible'] = !1) : (E.text = S['remarks'] && '' != S['remarks'] ? game['Tools']['strWithoutForbidden'](S['remarks']) : Y, E['visible'] = !0, v['visible'] = !1, C['visible'] = !0);
                                            };
                                        F(),
                                            C['clickHandler'] = Laya['Handler']['create'](this, function () {
                                                x = !0,
                                                    F();
                                            }, null, !1),
                                            h.on('blur', this, function () {
                                                x && (game['Tools']['calu_word_length'](h.text) > 30 ? f['UIMgr'].Inst['ShowErrorInfo'](game['Tools']['strOfLocalization'](2765)) : h.text != S['remarks'] && (S['remarks'] = h.text, app['NetAgent']['sendReq2Lobby']('Lobby', 'changeCollectedGameRecordRemarks', {
                                                    uuid: K.uuid,
                                                    remarks: h.text
                                                }, function () { }))),
                                                    x = !1,
                                                    F();
                                            });
                                        var W = N['getChildByName']('collect');
                                        W['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            f['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](Q, function () {
                                                b['removeCollect'](K.uuid);
                                            }));
                                        }, null, !1),
                                            W['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star.png');
                                    } else {
                                        N['getChildByName']('input')['visible'] = !1,
                                            N['getChildByName']('btn_input')['visible'] = !1,
                                            N['getChildByName']('remarks_info')['visible'] = !0,
                                            N['getChildByName']('remarks_info').text = Y;
                                        var W = N['getChildByName']('collect');
                                        W['clickHandler'] = Laya['Handler']['create'](this, function () {
                                            Q['pop_collectinput'].show(K.uuid, K['start_time'], K['end_time']);
                                        }, null, !1),
                                            W['getChildByName']('img').skin = game['Tools']['localUISrc']('myres/lobby/collect_star_gray.png');
                                    }
                                }
                            }
                        },
                        b['prototype']['onLoadStateChange'] = function (f, H) {
                            this['current_type'] == f && (this['loading']['visible'] = H);
                        },
                        b['prototype']['onLoadMoreLst'] = function (f, H) {
                            this['current_type'] == f && this['scrollview']['addItem'](H);
                        },
                        b['prototype']['getScrollViewCount'] = function () {
                            return this['scrollview']['value_count'];
                        },
                        b['prototype']['onLoadOver'] = function (f) {
                            if (this['current_type'] == f) {
                                var H = b['paipuLst'][this['current_type']];
                                0 == H['count'] && (this['noinfo']['visible'] = !0);
                            }
                        },
                        b['prototype']['onCollectChange'] = function (f, H) {
                            if (this['current_type'] == Q['COLLECT'])
                                H >= 0 && (b['paipuLst'][Q['COLLECT']]['removeAt'](H), this['scrollview']['delItem'](H));
                            else
                                for (var N = b['paipuLst'][this['current_type']]['uuid_list'], D = 0; D < N['length']; D++)
                                    if (N[D] == f) {
                                        this['scrollview']['wantToRefreshItem'](D);
                                        break;
                                    }
                            this['label_collect_count'].text = b['collect_lsts']['length']['toString']() + '/' + b['collect_limit']['toString']();
                        },
                        b['prototype']['refreshAll'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        b.Inst = null,
                        b['paipuLst'] = {},
                        b['collect_lsts'] = [],
                        b['record_map'] = {},
                        b['collect_info'] = {},
                        b['collect_limit'] = 20,
                        b;
                }
                    (f['UIBase']);
            f['UI_PaiPu'] = K;
        }
            (uiscript || (uiscript = {}));










        // 反屏蔽名称与文本审查
        GameMgr.Inst.gameInit = function () {
            var f = GameMgr;
            var H = this;
            if (window.p2 = 'DF2vkXCnfeXp4WoGSBGNcJBufZiMN3UP' + (window['pertinent3'] ? window['pertinent3'] : ''), view['BgmListMgr'].init(), this['use_fetch_info'] || (app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerTime', {}, function (f, N) {
                f || N['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerTime', f, N) : H['server_time_delta'] = 1000 * N['server_time'] - Laya['timer']['currTimer'];
            }), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchServerSettings', {}, function (f, N) {
                f || N['error'] ? uiscript['UIMgr'].Inst['showNetReqError']('fetchServerSettings', f, N) : (app.Log.log('fetchServerSettings: ' + JSON['stringify'](N)), H['updateServerSettings'](N['settings']));
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchConnectionInfo', {}, function (f, N) {
                f || N['error'] || (H['client_endpoint'] = N['client_endpoint']);
            }), app['PlayerBehaviorStatistic'].init(), this['account_data']['nickname'] && this['fetch_login_info'](), uiscript['UI_Info'].Init(), app['NetAgent']['AddListener2Lobby']('NotifyAccountUpdate', Laya['Handler']['create'](this, function (f) {
                app.Log.log('NotifyAccountUpdate :' + JSON['stringify'](f));
                var N = f['update'];
                if (N) {
                    if (N['numerical'])
                        for (var Q = 0; Q < N['numerical']['length']; Q++) {
                            var D = N['numerical'][Q].id,
                                K = N['numerical'][Q]['final'];
                            switch (D) {
                                case '100001':
                                    H['account_data']['diamond'] = K;
                                    break;
                                case '100002':
                                    H['account_data'].gold = K;
                                    break;
                                case '100099':
                                    H['account_data'].vip = K,
                                        uiscript['UI_Recharge'].Inst && uiscript['UI_Recharge'].Inst['enable'] && uiscript['UI_Recharge'].Inst['refreshVipRedpoint']();
                            }
                            (D >= '101001' || '102999' >= D) && (H['account_numerical_resource'][D] = K);
                        }
                    uiscript['UI_Sushe']['on_data_updata'](N),
                        N['daily_task'] && uiscript['UI_Activity_Xuanshang']['dataUpdate'](N['daily_task']),
                        N['title'] && uiscript['UI_TitleBook']['title_update'](N['title']),
                        N['new_recharged_list'] && uiscript['UI_Recharge']['on_new_recharge_refresh'](N),
                        (N['activity_task'] || N['activity_period_task'] || N['activity_random_task'] || N['activity_segment_task']) && uiscript['UI_Activity']['accountUpdate'](N),
                        N['activity_flip_task'] && uiscript['UI_Activity_Fanpai']['onTaskDataUpdate'](N['activity_flip_task']['progresses']),
                        N['activity'] && (N['activity']['friend_gift_data'] && uiscript['UI_Activity_Miaohui']['updateFriendGiftData'](N['activity']['friend_gift_data']), N['activity']['upgrade_data'] && uiscript['UI_Activity_Miaohui']['updateUpgradeData'](N['activity']['upgrade_data']), N['activity']['gacha_data'] && uiscript['UI_Activity_Niudan']['update_data'](N['activity']['gacha_data']), N['activity']['simulation_data'] && uiscript['UI_Activity_Simulation']['update_data'](N['activity']['simulation_data']), N['activity']['spot_data'] && uiscript['UI_Activity_Spot']['update_data'](N['activity']['spot_data']), N['activity']['combining_data'] && uiscript['UI_Activity_Combining']['update_data'](N['activity']['combining_data']));
                }
            }, null, !1)), app['NetAgent']['AddListener2Lobby']('NotifyAnotherLogin', Laya['Handler']['create'](this, function () {
                uiscript['UI_AnotherLogin'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyAccountLogout', Laya['Handler']['create'](this, function () {
                uiscript['UI_Hanguplogout'].Inst.show();
            })), app['NetAgent']['AddListener2Lobby']('NotifyClientMessage', Laya['Handler']['create'](this, function (f) {
                app.Log.log('收到消息：' + JSON['stringify'](f)),
                    f.type == game['EFriendMsgType']['room_invite'] && uiscript['UI_Invite']['onNewInvite'](f['content']);
            })), app['NetAgent']['AddListener2Lobby']('NotifyServerSetting', Laya['Handler']['create'](this, function (f) {
                uiscript['UI_Recharge']['open_payment'] = !1,
                    uiscript['UI_Recharge']['payment_info'] = '',
                    uiscript['UI_Recharge']['open_wx'] = !0,
                    uiscript['UI_Recharge']['wx_type'] = 0,
                    uiscript['UI_Recharge']['open_alipay'] = !0,
                    uiscript['UI_Recharge']['alipay_type'] = 0,
                    f['settings'] && (uiscript['UI_Recharge']['update_payment_setting'](f['settings']), f['settings']['nickname_setting'] && (H['nickname_replace_enable'] = !!f['settings']['nickname_setting']['enable'], H['nickname_replace_lst'] = f['settings']['nickname_setting']['nicknames'])),
                    uiscript['UI_Change_Nickname']['allow_modify_nickname'] = f['allow_modify_nickname'];
                // START
                if (MMP.settings.antiCensorship == true) {
                    app.Taboo.test = function () { return null };
                    GameMgr.Inst.nickname_replace_enable = false;
                }
                // END
            })), app['NetAgent']['AddListener2Lobby']('NotifyVipLevelChange', Laya['Handler']['create'](this, function (f) {
                uiscript['UI_Sushe']['send_gift_limit'] = f['gift_limit'],
                    game['FriendMgr']['friend_max_count'] = f['friend_max_count'],
                    uiscript['UI_Shop']['shopinfo'].zhp['free_refresh']['limit'] = f['zhp_free_refresh_limit'],
                    uiscript['UI_Shop']['shopinfo'].zhp['cost_refresh']['limit'] = f['zhp_cost_refresh_limit'],
                    uiscript['UI_PaiPu']['collect_limit'] = f['record_collect_limit'];
            })), app['NetAgent']['AddListener2Lobby']('NotifyAFKResult', new Laya['Handler'](this, function (f) {
                uiscript['UI_Guajichenfa'].Inst.show(f);
            })), app['NetAgent']['AddListener2Lobby']('NotifyCaptcha', new Laya['Handler'](this, function (f) {
                H['auth_check_id'] = f['check_id'],
                    H['auth_nc_retry_count'] = 0,
                    4 == f.type ? H['showNECaptcha']() : 2 == f.type ? H['checkNc']() : H['checkNvc']();
            })), Laya['timer'].loop(360000, this, function () {
                if (game['LobbyNetMgr'].Inst.isOK) {
                    var f = (Laya['timer']['currTimer'] - H['_last_heatbeat_time']) / 1000;
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'heatbeat', {
                        no_operation_counter: f
                    }, function () { }),
                        f >= 3000 && uiscript['UI_Hanguplogout'].Inst.show();
                }
            }), Laya['timer'].loop(1000, this, function () {
                var f = Laya['stage']['getMousePoint']();
                (f.x != H['_pre_mouse_point'].x || f.y != H['_pre_mouse_point'].y) && (H['clientHeatBeat'](), H['_pre_mouse_point'].x = f.x, H['_pre_mouse_point'].y = f.y);
            }), Laya['timer'].loop(1000, this, function () {
                Laya['LocalStorage']['setItem']('dolllt', game['Tools']['currentTime']['toString']());
            }), 'kr' == f['client_type'] && Laya['timer'].loop(3600000, this, function () {
                H['showKrTip'](!1, null);
            }), uiscript['UI_RollNotice'].init(), 'jp' == f['client_language']) {
                var N = document['createElement']('link');
                N.rel = 'stylesheet',
                    N.href = 'font/notosansjapanese_1.css';
                var Q = document['getElementsByTagName']('head')[0];
                Q['appendChild'](N);
            }
        }







        // 设置状态
        !function (f) {
            var H = function () {
                function f(H) {
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
                        f.Inst = this,
                        this.me = H,
                        this['_container_c0'] = this.me['getChildByName']('c0');
                    for (var N = 0; 3 > N; N++)
                        this['_img_countdown_c0'].push(this['_container_c0']['getChildByName']('num' + N));
                    this['_container_c1'] = this.me['getChildByName']('c1');
                    for (var N = 0; 3 > N; N++)
                        this['_img_countdown_c1'].push(this['_container_c1']['getChildByName']('num' + N));
                    for (var N = 0; 2 > N; N++)
                        this['_img_countdown_add'].push(this.me['getChildByName']('plus')['getChildByName']('add_' + N));
                    this['_img_countdown_plus'] = this.me['getChildByName']('plus'),
                        this.me['visible'] = !1;
                }
                return Object['defineProperty'](f['prototype'], 'timeuse', {
                    get: function () {
                        return this.me['visible'] ? Math['floor']((Laya['timer']['currTimer'] - this['_start']) / 1000) : 0;
                    },
                    enumerable: !1,
                    configurable: !0
                }),
                    f['prototype']['reset'] = function () {
                        this.me['visible'] = !1,
                            Laya['timer']['clearAll'](this);
                    },
                    f['prototype']['showCD'] = function (f, H) {
                        var N = this;
                        this.me['visible'] = !0,
                            this['_start'] = Laya['timer']['currTimer'],
                            this._fix = Math['floor'](f / 1000),
                            this._add = Math['floor'](H / 1000),
                            this['_pre_sec'] = -1,
                            this['_pre_time'] = Laya['timer']['currTimer'],
                            this['_show'](),
                            Laya['timer']['frameLoop'](1, this, function () {
                                var f = Laya['timer']['currTimer'] - N['_pre_time'];
                                N['_pre_time'] = Laya['timer']['currTimer'],
                                    view['DesktopMgr'].Inst['timestoped'] ? N['_start'] += f : N['_show']();
                            });
                    },
                    f['prototype']['close'] = function () {
                        this['reset']();
                    },
                    f['prototype']['_show'] = function () {
                        var f = this._fix + this._add - this['timeuse'];
                        if (0 >= f)
                            return view['DesktopMgr'].Inst['OperationTimeOut'](), this['reset'](), void 0;
                        if (f != this['_pre_sec']) {
                            if (this['_pre_sec'] = f, f > this._add) {
                                for (var H = (f - this._add)['toString'](), N = 0; N < this['_img_countdown_c0']['length']; N++)
                                    this['_img_countdown_c0'][N]['visible'] = N < H['length'];
                                if (3 == H['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + H[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + H[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + H[2] + '.png')) : 2 == H['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + H[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + H[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/t_' + H[0] + '.png'), 0 != this._add) {
                                    this['_img_countdown_plus']['visible'] = !0;
                                    for (var Q = this._add['toString'](), N = 0; N < this['_img_countdown_add']['length']; N++) {
                                        var D = this['_img_countdown_add'][N];
                                        N < Q['length'] ? (D['visible'] = !0, D.skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + Q[N] + '.png')) : D['visible'] = !1;
                                    }
                                } else {
                                    this['_img_countdown_plus']['visible'] = !1;
                                    for (var N = 0; N < this['_img_countdown_add']['length']; N++)
                                        this['_img_countdown_add'][N]['visible'] = !1;
                                }
                            } else {
                                this['_img_countdown_plus']['visible'] = !1;
                                for (var H = f['toString'](), N = 0; N < this['_img_countdown_c0']['length']; N++)
                                    this['_img_countdown_c0'][N]['visible'] = N < H['length'];
                                3 == H['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + H[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + H[0] + '.png'), this['_img_countdown_c0'][2].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + H[2] + '.png')) : 2 == H['length'] ? (this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + H[1] + '.png'), this['_img_countdown_c0'][1].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + H[0] + '.png')) : this['_img_countdown_c0'][0].skin = game['Tools']['localUISrc']('myres/mjdesktop/number/at_' + H[0] + '.png');
                            }
                            if (f > 3) {
                                this['_container_c1']['visible'] = !1;
                                for (var N = 0; N < this['_img_countdown_c0']['length']; N++)
                                    this['_img_countdown_c0'][N]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                            } else {
                                view['AudioMgr']['PlayAudio'](205),
                                    this['_container_c1']['visible'] = !0;
                                for (var N = 0; N < this['_img_countdown_c0']['length']; N++)
                                    this['_img_countdown_c0'][N]['alpha'] = 1;
                                this['_img_countdown_plus']['alpha'] = 1,
                                    this['_container_c0']['alpha'] = 1,
                                    this['_container_c1']['alpha'] = 1;
                                for (var N = 0; N < this['_img_countdown_c1']['length']; N++)
                                    this['_img_countdown_c1'][N]['visible'] = this['_img_countdown_c0'][N]['visible'], this['_img_countdown_c1'][N].skin = game['Tools']['localUISrc'](this['_img_countdown_c0'][N].skin);
                                I.Inst.me.cd1.play(0, !1);
                            }
                        }
                    },
                    f.Inst = null,
                    f;
            }
                (),
                N = function () {
                    function f(f) {
                        this['timer_id'] = 0,
                            this['last_returned'] = !1,
                            this.me = f;
                    }
                    return f['prototype']['begin_refresh'] = function () {
                        this['timer_id'] && clearTimeout(this['timer_id']),
                            this['last_returned'] = !0,
                            this['_loop_refresh_delay'](),
                            Laya['timer']['clearAll'](this),
                            Laya['timer'].loop(100, this, this['_loop_show']);
                    },
                        f['prototype']['close_refresh'] = function () {
                            this['timer_id'] && (clearTimeout(this['timer_id']), this['timer_id'] = 0),
                                this['last_returned'] = !1,
                                Laya['timer']['clearAll'](this);
                        },
                        f['prototype']['_loop_refresh_delay'] = function () {
                            var f = this;
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none) {
                                var H = 2000;
                                if (game['MJNetMgr'].Inst['connect_state'] == game['EConnectState']['connecting'] && this['last_returned']) {
                                    var N = app['NetAgent']['mj_network_delay'];
                                    H = 300 > N ? 2000 : 800 > N ? 2500 + N : 4000 + 0.5 * N,
                                        app['NetAgent']['sendReq2MJ']('FastTest', 'checkNetworkDelay', {}, function () {
                                            f['last_returned'] = !0;
                                        }),
                                        this['last_returned'] = !1;
                                } else
                                    H = 1000;
                                this['timer_id'] = setTimeout(this['_loop_refresh_delay'].bind(this), H);
                            }
                        },
                        f['prototype']['_loop_show'] = function () {
                            if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState'].none)
                                if (game['MJNetMgr'].Inst['connect_state'] != game['EConnectState']['connecting'])
                                    this.me.skin = game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                else {
                                    var f = app['NetAgent']['mj_network_delay'];
                                    this.me.skin = 300 > f ? game['Tools']['localUISrc']('myres/mjdesktop/signal_good.png') : 800 > f ? game['Tools']['localUISrc']('myres/mjdesktop/signal_normal.png') : game['Tools']['localUISrc']('myres/mjdesktop/signal_bad.png');
                                }
                        },
                        f;
                }
                    (),
                Q = function () {
                    function f(f, H) {
                        var N = this;
                        this['enable'] = !1,
                            this['emj_banned'] = !1,
                            this['locking'] = !1,
                            this['localposition'] = H,
                            this.me = f,
                            this['btn_banemj'] = f['getChildByName']('btn_banemj'),
                            this['btn_banemj_origin_x'] = this['btn_banemj'].x,
                            this['btn_banemj_origin_y'] = this['btn_banemj'].y,
                            this['img_bannedemj'] = this['btn_banemj']['getChildByName']('mute'),
                            this['btn_seeinfo'] = f['getChildByName']('btn_seeinfo'),
                            this['btn_seeinfo_origin_x'] = this['btn_seeinfo'].x,
                            this['btn_seeinfo_origin_y'] = this['btn_seeinfo'].y,
                            this['btn_change'] = f['getChildByName']('btn_change'),
                            this['btn_change_origin_x'] = this['btn_change'].x,
                            this['btn_change_origin_y'] = this['btn_change'].y,
                            this['btn_banemj']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                N['locking'] || (N['emj_banned'] = !N['emj_banned'], N['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (N['emj_banned'] ? '_on.png' : '.png')), N['close']());
                            }, null, !1),
                            this['btn_seeinfo']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                N['locking'] || (N['close'](), I.Inst['btn_seeinfo'](N['localposition']));
                            }, null, !1),
                            this['btn_change']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                N['locking'] || (N['close'](), view['DesktopMgr'].Inst['changeMainbody'](view['DesktopMgr'].Inst['localPosition2Seat'](N['localposition'])));
                            }, null, !1),
                            this.me['clickHandler'] = Laya['Handler']['create'](this, function () {
                                N['locking'] || N['switch']();
                            }, null, !1);
                    }
                    return f['prototype']['reset'] = function (f, H, N) {
                        Laya['timer']['clearAll'](this),
                            this['locking'] = !1,
                            this['enable'] = !1,
                            this['showinfo'] = f,
                            this['showemj'] = H,
                            this['showchange'] = N,
                            this['emj_banned'] = !1,
                            this['btn_banemj']['visible'] = !1,
                            this['btn_seeinfo']['visible'] = !1,
                            this['img_bannedemj'].skin = game['Tools']['localUISrc']('myres/mjdesktop/mute' + (this['emj_banned'] ? '_on.png' : '.png')),
                            this['btn_change']['visible'] = !1;
                    },
                        f['prototype']['onChangeSeat'] = function (f, H, N) {
                            this['showinfo'] = f,
                                this['showemj'] = H,
                                this['showchange'] = N,
                                this['enable'] = !1,
                                this['btn_banemj']['visible'] = !1,
                                this['btn_seeinfo']['visible'] = !1,
                                this['btn_change']['visible'] = !1;
                        },
                        f['prototype']['switch'] = function () {
                            var f = this;
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
                                f['locking'] = !1;
                            })));
                        },
                        f['prototype']['close'] = function () {
                            var f = this;
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
                                    f['locking'] = !1,
                                        f['btn_banemj']['visible'] = !1,
                                        f['btn_seeinfo']['visible'] = !1,
                                        f['btn_change']['visible'] = !1;
                                });
                        },
                        f;
                }
                    (),
                D = function () {
                    function f(f) {
                        var H = this;
                        this['btn_emos'] = [],
                            this.emos = [],
                            this['allgray'] = !1,
                            this.me = f,
                            this.in = this.me['getChildByName']('in'),
                            this.out = this.me['getChildByName']('out'),
                            this['in_out'] = this.in['getChildByName']('in_out'),
                            this['btn_chat'] = this.out['getChildByName']('btn_chat'),
                            this['btn_mask'] = this.out['getChildByName']('btn_mask'),
                            this['btn_chat']['clickHandler'] = new Laya['Handler'](this, function () {
                                H['switchShow'](!0);
                            }),
                            this['btn_chat_in'] = this['in_out']['getChildByName']('btn_chat'),
                            this['btn_chat_in']['clickHandler'] = new Laya['Handler'](this, function () {
                                H['switchShow'](!1);
                            }),
                            this['scrollbar'] = this.in['getChildByName']('scrollbar_light')['scriptMap']['capsui.CScrollBar'],
                            this['scrollview'] = this.in['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), -1, 3),
                            this['scrollview']['reset'](),
                            this['scrollbar'].init(null),
                            this['scrollview'].me.on('ratechange', this, function () {
                                H['scrollview']['total_height'] > 0 ? H['scrollbar']['setVal'](H['scrollview'].rate, H['scrollview']['view_height'] / H['scrollview']['total_height']) : H['scrollbar']['setVal'](0, 1);
                            }),
                            'chs' != GameMgr['client_language'] ? (this.out['getChildAt'](2)['visible'] = !1, this.out['getChildAt'](3)['visible'] = !0) : (this.out['getChildAt'](2)['visible'] = !0, this.out['getChildAt'](3)['visible'] = !1);
                    }
                    return f['prototype']['initRoom'] = function () {
                        var f = view['DesktopMgr'].Inst['main_role_character_info'],
                            H = cfg['item_definition']['character'].find(f['charid']);
                        this['emo_log_count'] = 0,
                            this.emos = [];
                        for (var N = 0; 9 > N; N++)
                            this.emos.push({
                                path: H.emo + '/' + N + '.png',
                                sub_id: N,
                                sort: N
                            });
                        if (f['extra_emoji'])
                            for (var N = 0; N < f['extra_emoji']['length']; N++)
                                this.emos.push({
                                    path: H.emo + '/' + f['extra_emoji'][N] + '.png',
                                    sub_id: f['extra_emoji'][N],
                                    sort: f['extra_emoji'][N] > 12 ? 1000000 - f['extra_emoji'][N] : f['extra_emoji'][N]
                                });
                        this.emos = this.emos.sort(function (f, H) {
                            return f.sort - H.sort;
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
                                char_id: f['charid'],
                                emoji: [],
                                server: 'chs_t' == GameMgr['client_type'] ? 1 : 'jp' == GameMgr['client_type'] ? 2 : 3
                            };
                    },
                        f['prototype']['render_item'] = function (f) {
                            var H = this,
                                N = f['index'],
                                Q = f['container'],
                                D = this.emos[N],
                                K = Q['getChildByName']('btn');
                            K.skin = game['LoadMgr']['getResImageSkin'](D.path),
                                this['allgray'] ? game['Tools']['setGrayDisable'](K, !0) : (game['Tools']['setGrayDisable'](K, !1), K['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (app['NetAgent']['isMJConnectOK']()) {
                                        GameMgr.Inst['BehavioralStatistics'](22);
                                        for (var f = !1, N = 0, Q = H['emo_infos']['emoji']; N < Q['length']; N++) {
                                            var K = Q[N];
                                            if (K[0] == D['sub_id']) {
                                                K[0]++,
                                                    f = !0;
                                                break;
                                            }
                                        }
                                        f || H['emo_infos']['emoji'].push([D['sub_id'], 1]),
                                            app['NetAgent']['sendReq2MJ']('FastTest', 'broadcastInGame', {
                                                content: JSON['stringify']({
                                                    emo: D['sub_id']
                                                }),
                                                except_self: !1
                                            }, function () { });
                                    }
                                    H['change_all_gray'](!0),
                                        Laya['timer'].once(5000, H, function () {
                                            H['change_all_gray'](!1);
                                        }),
                                        H['switchShow'](!1);
                                }, null, !1));
                        },
                        f['prototype']['change_all_gray'] = function (f) {
                            this['allgray'] = f,
                                this['scrollview']['wantToRefreshAll']();
                        },
                        f['prototype']['switchShow'] = function (f) {
                            var H = this,
                                N = 0;
                            N = f ? 1367 : 1896,
                                Laya['Tween'].to(this.me, {
                                    x: 1972
                                }, f ? 60 : 140, Laya.Ease['strongOut'], Laya['Handler']['create'](this, function () {
                                    f ? (H.out['visible'] = !1, H.in['visible'] = !0) : (H.out['visible'] = !0, H.in['visible'] = !1),
                                        Laya['Tween'].to(H.me, {
                                            x: N
                                        }, f ? 140 : 60, Laya.Ease['strongOut'], Laya['Handler']['create'](H, function () {
                                            H['btn_chat']['disabled'] = !1,
                                                H['btn_chat_in']['disabled'] = !1;
                                        }), 0, !0, !0);
                                }), 0, !0, !0),
                                this['btn_chat']['disabled'] = !0,
                                this['btn_chat_in']['disabled'] = !0;
                        },
                        f['prototype']['sendEmoLogUp'] = function () {
                            // START
                            //if (this['emo_log_count'] > 0 && this['emo_infos'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                            //    var f = GameMgr.Inst['getMouse']();
                            //    GameMgr.Inst['postInfo2Server']('emo_stats', {
                            //        data: this['emo_infos'],
                            //        m: view['DesktopMgr']['click_prefer'],
                            //        d: f,
                            //        e: window['innerHeight'] / 2,
                            //        f: window['innerWidth'] / 2,
                            //        t: I.Inst['min_double_time'],
                            //        g: I.Inst['max_double_time']
                            //    }, !1),
                            //    this['emo_infos']['emoji'] = [];
                            // }
                            //this['emo_log_count']++;
                            // END
                        },
                        f['prototype']['reset'] = function () {
                            this['emo_infos'] = null,
                                this['scrollbar']['reset'](),
                                this['scrollview']['reset']();
                        },
                        f;
                }
                    (),
                K = function () {
                    function H(H) {
                        this['effect'] = null,
                            this['container_emo'] = H['getChildByName']('chat_bubble'),
                            this.emo = new f['UI_Character_Emo'](this['container_emo']['getChildByName']('content')),
                            this['root_effect'] = H['getChildByName']('root_effect'),
                            this['container_emo']['visible'] = !1;
                    }
                    return H['prototype'].show = function (f, H) {
                        var N = this;
                        if (!view['DesktopMgr'].Inst['emoji_switch']) {
                            for (var Q = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](f)]['character']['charid'], D = cfg['character']['emoji']['getGroup'](Q), K = '', b = 0, I = 10 > H, q = 0; q < D['length']; q++)
                                if (D[q]['sub_id'] == H) {
                                    I = !0,
                                        2 == D[q].type && (K = D[q].view, b = D[q]['audio']);
                                    break;
                                }
                            I || (H = 0),
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null),
                                K ? (this['effect'] = game['FrontEffect'].Inst['create_ui_effect'](this['root_effect'], 'scene/' + K + '.lh', new Laya['Point'](0, 0), 1), Laya['timer'].once(3500, this, function () {
                                    N['effect'] && (N['effect']['destory'](), N['effect'] = null);
                                }), b && view['AudioMgr']['PlayAudio'](b)) : (this.emo['setSkin'](Q, H), this['container_emo']['visible'] = !0, this['container_emo']['scaleX'] = this['container_emo']['scaleY'] = 0, Laya['Tween'].to(this['container_emo'], {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 120, null, null, 0, !0, !0), Laya['timer'].once(3000, this, function () {
                                    Laya['Tween'].to(N['container_emo'], {
                                        scaleX: 0,
                                        scaleY: 0
                                    }, 120, null, null, 0, !0, !0);
                                }), Laya['timer'].once(3500, this, function () {
                                    N['container_emo']['visible'] = !1,
                                        N.emo['clear']();
                                }));
                        }
                    },
                        H['prototype']['reset'] = function () {
                            Laya['timer']['clearAll'](this),
                                this.emo['clear'](),
                                this['container_emo']['visible'] = !1,
                                this['effect'] && (this['effect']['destory'](), this['effect'] = null);
                        },
                        H;
                }
                    (),
                b = function () {
                    function f(f, H) {
                        if (this['_moqie_counts'] = [0, 3, 5, 7, 9, 12], this['_shouqie_counts'] = [0, 3, 6, 9, 12, 18], this['_fan_counts'] = [0, 1, 2, 3, 5, 12], this['_now_moqie_bonus'] = 0, this['_now_shouqie_bonus'] = 0, this['index'] = H, this.me = f, 0 == H) {
                            var N = f['getChildByName']('moqie');
                            this['moqie'] = N['getChildByName']('moqie'),
                                this['tip_moqie'] = N['getChildByName']('tip'),
                                this['circle_moqie'] = this['tip_moqie']['getChildByName']('circle'),
                                this['label_moqie'] = this['tip_moqie']['getChildByName']('label'),
                                this['points_moqie'] = [];
                            var Q = this['tip_moqie']['getChildByName']('circle')['getChildByName']('0');
                            this['points_moqie'].push(Q);
                            for (var D = 0; 5 > D; D++) {
                                var K = Q['scriptMap']['capsui.UICopy']['getNodeClone']();
                                this['points_moqie'].push(K);
                            }
                            var b = f['getChildByName']('shouqie');
                            this['shouqie'] = b['getChildByName']('shouqie'),
                                this['tip_shouqie'] = b['getChildByName']('tip'),
                                this['label_shouqie'] = this['tip_shouqie']['getChildByName']('label'),
                                this['points_shouqie'] = [],
                                this['circle_shouqie'] = this['tip_shouqie']['getChildByName']('circle'),
                                Q = this['tip_shouqie']['getChildByName']('circle')['getChildByName']('0'),
                                this['points_shouqie'].push(Q);
                            for (var D = 0; 5 > D; D++) {
                                var K = Q['scriptMap']['capsui.UICopy']['getNodeClone']();
                                this['points_shouqie'].push(K);
                            }
                            'jp' == GameMgr['client_language'] ? (this['label_moqie']['wordWrap'] = !1, this['label_shouqie']['wordWrap'] = !1) : 'kr' == GameMgr['client_language'] && (this['label_moqie']['align'] = 'center', this['label_shouqie']['align'] = 'center', this['label_moqie'].x = 5, this['label_shouqie'].x = 5);
                        } else
                            this['moqie'] = f['getChildByName']('moqie'), this['shouqie'] = f['getChildByName']('shouqie');
                        this['star_moqie'] = this['moqie']['getChildByName']('star'),
                            this['star_shouqie'] = this['shouqie']['getChildByName']('star');
                    }
                    return f['prototype'].show = function (f, H, N, Q, D) {
                        var K = this;
                        if (this.me['visible'] = !0, H != this['_now_moqie_bonus']) {
                            if (this['_now_moqie_bonus'] = H, this['moqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_' + H + '.png'), D) {
                                var b = 0 == this['index'] ? this['moqie']['parent'] : this['moqie'];
                                b['parent']['setChildIndex'](b, 1),
                                    Laya['Tween']['clearAll'](this['moqie']),
                                    Laya['Tween'].to(this['moqie'], {
                                        scaleX: 4,
                                        scaleY: 4
                                    }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                        Laya['Tween'].to(K['moqie'], {
                                            scaleX: 1,
                                            scaleY: 1
                                        }, 300, Laya.Ease['quadOut'], null, 100);
                                    }));
                            }
                            this['star_moqie']['visible'] = H == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                        if (Q != this['_now_shouqie_bonus']) {
                            if (this['_now_shouqie_bonus'] = Q, this['shouqie'].skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_' + Q + '.png'), D) {
                                var b = 0 == this['index'] ? this['shouqie']['parent'] : this['shouqie'];
                                b['parent']['setChildIndex'](b, 1),
                                    Laya['Tween']['clearAll'](this['shouqie']),
                                    Laya['Tween'].to(this['shouqie'], {
                                        scaleX: 4,
                                        scaleY: 4
                                    }, 300, Laya.Ease['quadOut'], Laya['Handler']['create'](this, function () {
                                        Laya['Tween'].to(K['shouqie'], {
                                            scaleX: 1,
                                            scaleY: 1
                                        }, 300, Laya.Ease['quadOut'], null, 100);
                                    }));
                            }
                            this['star_shouqie']['visible'] = Q == this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                        if (0 == this['index']) {
                            for (var I = this['_fan_counts']['indexOf'](H), q = this['_moqie_counts'][I + 1] - this['_moqie_counts'][I], a = f - this['_moqie_counts'][I], J = 0; J < this['points_moqie']['length']; J++) {
                                var k = this['points_moqie'][J];
                                if (q > J) {
                                    k['visible'] = !0;
                                    var r = J / q * 2 * Math.PI;
                                    k.pos(27 * Math.sin(r) + 27, 27 - 27 * Math.cos(r)),
                                        k.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_r_point_' + (a > J ? 'l.png' : 'd.png'));
                                } else
                                    k['visible'] = !1;
                            }
                            this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['' + f]),
                                this['circle_moqie']['visible'] = H != this['_fan_counts'][this['_fan_counts']['length'] - 1],
                                I = this['_fan_counts']['indexOf'](Q),
                                q = this['_shouqie_counts'][I + 1] - this['_shouqie_counts'][I],
                                a = N - this['_shouqie_counts'][I];
                            for (var J = 0; J < this['points_shouqie']['length']; J++) {
                                var k = this['points_shouqie'][J];
                                if (q > J) {
                                    k['visible'] = !0;
                                    var r = J / q * 2 * Math.PI;
                                    k.pos(27 * Math.sin(r) + 27, 27 - 27 * Math.cos(r)),
                                        k.skin = game['Tools']['localUISrc']('myres/mjdesktop/yc_b_point_' + (a > J ? 'l.png' : 'd.png'));
                                } else
                                    k['visible'] = !1;
                            }
                            this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['' + N]),
                                this['circle_shouqie']['visible'] = Q != this['_fan_counts'][this['_fan_counts']['length'] - 1];
                        }
                    },
                        f['prototype']['resetToStart'] = function () {
                            var f = this;
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
                                    f['_update']();
                                }),
                                this['_anim_start_time'] = Laya['timer']['currTimer'],
                                this['_update'](),
                                this['star_moqie']['visible'] = !1,
                                this['star_shouqie']['visible'] = !1,
                                0 == this['index'] && (this['label_moqie'].text = game['Tools']['strOfLocalization'](3975, ['0']), this['label_shouqie'].text = game['Tools']['strOfLocalization'](3976, ['0']));
                        },
                        f['prototype'].hide = function () {
                            Laya['timer']['clearAll'](this),
                                this.me['visible'] = !1;
                        },
                        f['prototype']['_update'] = function () {
                            var f = (Laya['timer']['currTimer'] - this['_anim_start_time']) / 2000 % 1,
                                H = 1.4 * Math.abs(f - 0.5) + 0.8;
                            this['star_moqie']['getChildAt'](0)['scale'](H, H),
                                this['star_shouqie']['getChildAt'](0)['scale'](H, H),
                                f = (f + 0.4) % 1;
                            var N = 1.4 * Math.abs(f - 0.5) + 0.8;
                            this['star_moqie']['getChildAt'](1)['scale'](N, N),
                                this['star_shouqie']['getChildAt'](1)['scale'](N, N);
                        },
                        f;
                }
                    (),
                I = function (I) {
                    function q() {
                        var f = I.call(this, new ui.mj['desktopInfoUI']()) || this;
                        return f['container_doras'] = null,
                            f['doras'] = [],
                            f['front_doras'] = [],
                            f['label_md5'] = null,
                            f['container_gamemode'] = null,
                            f['label_gamemode'] = null,
                            f['btn_auto_moqie'] = null,
                            f['btn_auto_nofulu'] = null,
                            f['btn_auto_hule'] = null,
                            f['img_zhenting'] = null,
                            f['btn_double_pass'] = null,
                            f['_network_delay'] = null,
                            f['_timecd'] = null,
                            f['_player_infos'] = [],
                            f['_container_fun'] = null,
                            f['_fun_in'] = null,
                            f['_fun_out'] = null,
                            f['showscoredeltaing'] = !1,
                            f['_btn_set'] = null,
                            f['_btn_leave'] = null,
                            f['_btn_fanzhong'] = null,
                            f['_btn_collect'] = null,
                            f['block_emo'] = null,
                            f['head_offset_y'] = 15,
                            f['gapStartPosLst'] = [new Laya['Vector2'](582, 12), new Laya['Vector2'](-266, 275), new Laya['Vector2'](-380, 103), new Laya['Vector2'](375, 142)],
                            f['selfGapOffsetX'] = [0, -150, 150],
                            app['NetAgent']['AddListener2MJ']('NotifyGameBroadcast', Laya['Handler']['create'](f, function (H) {
                                f['onGameBroadcast'](H);
                            })),
                            app['NetAgent']['AddListener2MJ']('NotifyPlayerConnectionState', Laya['Handler']['create'](f, function (H) {
                                f['onPlayerConnectionState'](H);
                            })),
                            q.Inst = f,
                            f;
                    }
                    return __extends(q, I),
                        q['prototype']['onCreate'] = function () {
                            var I = this;
                            this['doras'] = new Array(),
                                this['front_doras'] = [];
                            var q = this.me['getChildByName']('container_lefttop'),
                                a = q['getChildByName']('container_doras');
                            this['container_doras'] = a,
                                this['container_gamemode'] = q['getChildByName']('gamemode'),
                                this['label_gamemode'] = this['container_gamemode']['getChildByName']('lb_mode'),
                                'kr' == GameMgr['client_language'] && (this['label_gamemode']['scale'](0.85, 0.85), this['label_gamemode']['scriptMap']['capsui.LabelLocalizationSize']['onCreate']()),
                                this['label_md5'] = q['getChildByName']('MD5'),
                                q['getChildByName']('btn_md5change')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (I['label_md5']['visible'])
                                        Laya['timer']['clearAll'](I['label_md5']), I['label_md5']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() ? q['getChildByName']('activitymode')['visible'] = !0 : I['container_doras']['visible'] = !0;
                                    else {
                                        I['label_md5']['visible'] = !0,
                                            view['DesktopMgr'].Inst['sha256'] ? (I['label_md5']['fontSize'] = 20, I['label_md5'].y = 45, I['label_md5'].text = game['Tools']['strOfLocalization'](3888) + view['DesktopMgr'].Inst['sha256']) : (I['label_md5']['fontSize'] = 25, I['label_md5'].y = 51, I['label_md5'].text = game['Tools']['strOfLocalization'](2048) + view['DesktopMgr'].Inst.md5),
                                            q['getChildByName']('activitymode')['visible'] = !1,
                                            I['container_doras']['visible'] = !1;
                                        var f = I;
                                        Laya['timer'].once(5000, I['label_md5'], function () {
                                            f['label_md5']['visible'] = !1,
                                                view['DesktopMgr'].Inst['is_chuanma_mode']() ? q['getChildByName']('activitymode')['visible'] = !0 : I['container_doras']['visible'] = !0;
                                        });
                                    }
                                }, null, !1);
                            for (var J = 0; J < a['numChildren']; J++)
                                this['doras'].push(a['getChildAt'](J)), this['front_doras'].push(a['getChildAt'](J)['getChildAt'](0));
                            for (var J = 0; 4 > J; J++) {
                                var k = this.me['getChildByName']('container_player_' + J),
                                    r = {};
                                r['container'] = k,
                                    r.head = new f['UI_Head'](k['getChildByName']('head'), ''),
                                    r['head_origin_y'] = k['getChildByName']('head').y,
                                    r.name = k['getChildByName']('container_name')['getChildByName']('name'),
                                    r['container_shout'] = k['getChildByName']('container_shout'),
                                    r['container_shout']['visible'] = !1,
                                    r['illust'] = r['container_shout']['getChildByName']('illust')['getChildByName']('illust'),
                                    r['illustrect'] = f['UIRect']['CreateFromSprite'](r['illust']),
                                    r['shout_origin_x'] = r['container_shout'].x,
                                    r['shout_origin_y'] = r['container_shout'].y,
                                    r.emo = new K(k),
                                    r['disconnect'] = k['getChildByName']('head')['getChildByName']('head')['getChildByName']('disconnect'),
                                    r['disconnect']['visible'] = !1,
                                    r['title'] = new f['UI_PlayerTitle'](k['getChildByName']('title'), ''),
                                    r.que = k['getChildByName']('que'),
                                    r['que_target_pos'] = new Laya['Vector2'](r.que.x, r.que.y),
                                    r['tianming'] = k['getChildByName']('tianming'),
                                    r['tianming']['visible'] = !1,
                                    r['yongchang'] = new b(k['getChildByName']('yongchang'), J),
                                    r['yongchang'].hide(),
                                    0 == J ? (k['getChildByName']('btn_seeinfo')['clickHandler'] = Laya['Handler']['create'](this, function () {
                                        I['btn_seeinfo'](0);
                                    }, null, !1), k['getChildByName']('yongchang')['getChildByName']('btn')['clickHandler'] = new Laya['Handler'](this, function () {
                                        f['UI_Desktop_Yindao_Mode'].Inst.show('course/detail_course/course_yc.png');
                                    })) : r['headbtn'] = new Q(k['getChildByName']('btn_head'), J),
                                    this['_player_infos'].push(r);
                            }
                            this['_timecd'] = new H(this.me['getChildByName']('container_countdown')),
                                this['img_zhenting'] = this.me['getChildByName']('img_zhenting'),
                                this['img_zhenting']['visible'] = !1,
                                this['_initFunc'](),
                                this['block_emo'] = new D(this.me['getChildByName']('container_chat_choose')),
                                this.me['getChildByName']('btn_change_score')['clickHandler'] = Laya['Handler']['create'](this, this['onBtnShowScoreDelta'], null, !1),
                                this['_btn_leave'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_leave'),
                                this['_btn_leave']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    if (view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                        if (view['DesktopMgr'].Inst['gameing']) {
                                            for (var H = 0, N = 0; N < view['DesktopMgr'].Inst['player_datas']['length']; N++)
                                                view['DesktopMgr'].Inst['player_datas'][N]['account_id'] && H++;
                                            if (1 >= H)
                                                f['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](21), Laya['Handler']['create'](I, function () {
                                                    if (view['DesktopMgr'].Inst['gameing']) {
                                                        for (var f = 0, H = 0; H < view['DesktopMgr'].Inst['player_datas']['length']; H++) {
                                                            var N = view['DesktopMgr'].Inst['player_datas'][H];
                                                            N && null != N['account_id'] && 0 != N['account_id'] && f++;
                                                        }
                                                        1 == f ? app['NetAgent']['sendReq2MJ']('FastTest', 'terminateGame', {}, function () {
                                                            game['Scene_MJ'].Inst['GameEnd']();
                                                        }) : game['Scene_MJ'].Inst['ForceOut']();
                                                    }
                                                }));
                                            else {
                                                var Q = !1;
                                                if (f['UI_VoteProgress']['vote_info']) {
                                                    var D = Math['floor']((Date.now() + GameMgr.Inst['server_time_delta']) / 1000 - f['UI_VoteProgress']['vote_info']['start_time'] - f['UI_VoteProgress']['vote_info']['duration_time']);
                                                    0 > D && (Q = !0);
                                                }
                                                Q ? f['UI_VoteProgress'].Inst['enable'] || f['UI_VoteProgress'].Inst.show() : f['UI_VoteCD']['time_cd'] > (Date.now() + GameMgr.Inst['server_time_delta']) / 1000 ? f['UI_VoteCD'].Inst['enable'] || f['UI_VoteCD'].Inst.show() : f['UI_Vote'].Inst.show();
                                            }
                                        }
                                    } else
                                        view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] && (app['Log_OB'].log('quit ob'), f['UI_Ob_Replay'].Inst['resetRounds'](), f['UI_Ob_Replay'].Inst['enable'] = !1), game['Scene_MJ'].Inst['ForceOut']();
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'] && f['UI_Desktop_Yindao'].Inst['close']();
                                }, null, !1),
                                this['_btn_set'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_set'),
                                this['_btn_set']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    f['UI_Config'].Inst.show();
                                }, null, !1),
                                this['_btn_fanzhong'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_fanzhong'),
                                this['_btn_fanzhong']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    f['UI_Rules'].Inst.show(0, null, view['DesktopMgr'].Inst['is_chuanma_mode']() ? 1 : 0);
                                }, null, !1),
                                this['_btn_collect'] = this.me['getChildByName']('container_righttop')['getChildByName']('btn_collect'),
                                this['_btn_collect']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (f['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? f['UI_SecondConfirm'].Inst.show(game['Tools']['strOfLocalization'](3248), Laya['Handler']['create'](I, function () {
                                        f['UI_PaiPu']['removeCollect'](GameMgr.Inst['record_uuid']);
                                    })) : f['UI_Replay'].Inst && f['UI_Replay'].Inst['pop_collectinput'].show(GameMgr.Inst['record_uuid'], GameMgr.Inst['record_start_time'], GameMgr.Inst['record_end_time']));
                                }, null, !1),
                                this['btn_double_pass'] = this.me['getChildByName']('btn_double_pass'),
                                this['btn_double_pass']['visible'] = !1;
                            var d = 0;
                            this['btn_double_pass']['clickHandler'] = Laya['Handler']['create'](this, function () {
                                if (view['DesktopMgr']['double_click_pass']) {
                                    var H = Laya['timer']['currTimer'];
                                    if (d + 300 > H) {
                                        if (f['UI_ChiPengHu'].Inst['enable'])
                                            f['UI_ChiPengHu'].Inst['onDoubleClick'](), I['recordDoubleClickTime'](H - d);
                                        else {
                                            var N = view['DesktopMgr'].Inst['mainrole']['can_discard'];
                                            f['UI_LiQiZiMo'].Inst['enable'] && (N = f['UI_LiQiZiMo'].Inst['onDoubleClick'](N)),
                                                N && view['DesktopMgr'].Inst['mainrole']['onDoubleClick']() && I['recordDoubleClickTime'](H - d);
                                        }
                                        d = 0;
                                    } else
                                        d = H;
                                }
                            }, null, !1),
                                this['_network_delay'] = new N(this.me['getChildByName']('img_signal')),
                                this['container_jjc'] = this.me['getChildByName']('container_jjc'),
                                this['label_jjc_win'] = this['container_jjc']['getChildByName']('win'),
                                'en' == GameMgr['client_language'] && (q['getChildByName']('activitymode')['getChildAt'](1).x = 98);
                        },
                        q['prototype']['recordDoubleClickTime'] = function (f) {
                            this['min_double_time'] = this['min_double_time'] ? Math.max(0, Math.min(f, this['min_double_time'])) : f,
                                this['max_double_time'] = this['max_double_time'] ? Math.max(f, this['max_double_time']) : f;
                        },
                        q['prototype']['onGameBroadcast'] = function (f) {
                            app.Log.log('NotifyGameBroadcast ' + JSON['stringify'](f));
                            var H = view['DesktopMgr'].Inst['seat2LocalPosition'](f.seat),
                                N = JSON['parse'](f['content']);
                            null != N.emo && void 0 != N.emo && (this['onShowEmo'](H, N.emo), this['showAIEmo']());
                        },
                        q['prototype']['onPlayerConnectionState'] = function (f) {
                            app.Log.log('NotifyPlayerConnectionState msg: ' + JSON['stringify'](f));
                            var H = f.seat;
                            if (view['DesktopMgr']['player_link_state'] || (view['DesktopMgr']['player_link_state'] = [view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL, view['ELink_State'].NULL]), view['DesktopMgr']['player_link_state'] && H < view['DesktopMgr']['player_link_state']['length'] && (view['DesktopMgr']['player_link_state'][H] = f['state']), this['enable']) {
                                var N = view['DesktopMgr'].Inst['seat2LocalPosition'](H);
                                this['_player_infos'][N]['disconnect']['visible'] = f['state'] != view['ELink_State']['READY'];
                            }
                        },
                        q['prototype']['_initFunc'] = function () {
                            var f = this;
                            this['_container_fun'] = this.me['getChildByName']('container_func'),
                                this['_fun_in'] = this['_container_fun']['getChildByName']('in'),
                                this['_fun_out'] = this['_container_fun']['getChildByName']('out'),
                                this['_fun_in_spr'] = this['_fun_in']['getChildByName']('in_func');
                            var H = this['_fun_out']['getChildByName']('btn_func'),
                                N = this['_fun_out']['getChildByName']('btn_func2'),
                                Q = this['_fun_in_spr']['getChildByName']('btn_func');
                            H['clickHandler'] = N['clickHandler'] = new Laya['Handler'](this, function () {
                                var D = 0;
                                D = -270,
                                    Laya['Tween'].to(f['_container_fun'], {
                                        x: -624
                                    }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](f, function () {
                                        f['_fun_in']['visible'] = !0,
                                            f['_fun_out']['visible'] = !1,
                                            Laya['Tween'].to(f['_container_fun'], {
                                                x: D
                                            }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](f, function () {
                                                H['disabled'] = !1,
                                                    N['disabled'] = !1,
                                                    Q['disabled'] = !1,
                                                    f['_fun_out']['visible'] = !1;
                                            }), 0, !0, !0);
                                    })),
                                    H['disabled'] = !0,
                                    N['disabled'] = !0,
                                    Q['disabled'] = !0;
                            }, null, !1),
                                Q['clickHandler'] = new Laya['Handler'](this, function () {
                                    var D = -546;
                                    Laya['Tween'].to(f['_container_fun'], {
                                        x: -624
                                    }, 140, Laya.Ease['strongOut'], Laya['Handler']['create'](f, function () {
                                        f['_fun_in']['visible'] = !1,
                                            f['_fun_out']['visible'] = !0,
                                            Laya['Tween'].to(f['_container_fun'], {
                                                x: D
                                            }, 60, Laya.Ease['strongOut'], Laya['Handler']['create'](f, function () {
                                                H['disabled'] = !1,
                                                    N['disabled'] = !1,
                                                    Q['disabled'] = !1,
                                                    f['_fun_out']['visible'] = !0;
                                            }), 0, !0, !0);
                                    })),
                                        H['disabled'] = !0,
                                        N['disabled'] = !0,
                                        Q['disabled'] = !0;
                                });
                            var D = this['_fun_in']['getChildByName']('btn_autolipai'),
                                K = this['_fun_out']['getChildByName']('btn_autolipai2'),
                                b = this['_fun_out']['getChildByName']('autolipai'),
                                I = Laya['LocalStorage']['getItem']('autolipai'),
                                q = !0;
                            q = I && '' != I ? 'true' == I : !0,
                                this['refreshFuncBtnShow'](D, b, q),
                                D['clickHandler'] = K['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoLiPai'](!view['DesktopMgr'].Inst['auto_liqi']),
                                        f['refreshFuncBtnShow'](D, b, view['DesktopMgr'].Inst['auto_liqi']),
                                        Laya['LocalStorage']['setItem']('autolipai', view['DesktopMgr'].Inst['auto_liqi'] ? 'true' : 'false');
                                }, null, !1);
                            var a = this['_fun_in']['getChildByName']('btn_autohu'),
                                J = this['_fun_out']['getChildByName']('btn_autohu2'),
                                k = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](a, k, !1),
                                a['clickHandler'] = J['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoHule'](!view['DesktopMgr'].Inst['auto_hule']),
                                        f['refreshFuncBtnShow'](a, k, view['DesktopMgr'].Inst['auto_hule']);
                                }, null, !1);
                            var r = this['_fun_in']['getChildByName']('btn_autonoming'),
                                d = this['_fun_out']['getChildByName']('btn_autonoming2'),
                                X = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](r, X, !1),
                                r['clickHandler'] = d['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoNoFulu'](!view['DesktopMgr'].Inst['auto_nofulu']),
                                        f['refreshFuncBtnShow'](r, X, view['DesktopMgr'].Inst['auto_nofulu']);
                                }, null, !1);
                            var _ = this['_fun_in']['getChildByName']('btn_automoqie'),
                                c = this['_fun_out']['getChildByName']('btn_automoqie2'),
                                R = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](_, R, !1),
                                _['clickHandler'] = c['clickHandler'] = Laya['Handler']['create'](this, function () {
                                    view['DesktopMgr'].Inst['setAutoMoQie'](!view['DesktopMgr'].Inst['auto_moqie']),
                                        f['refreshFuncBtnShow'](_, R, view['DesktopMgr'].Inst['auto_moqie']);
                                }, null, !1),
                                'kr' == GameMgr['client_language'] && (b['scale'](0.9, 0.9), k['scale'](0.9, 0.9), X['scale'](0.9, 0.9), R['scale'](0.9, 0.9)),
                                Laya['Browser'].onPC && !GameMgr['inConch'] ? (H['visible'] = !1, J['visible'] = !0, K['visible'] = !0, d['visible'] = !0, c['visible'] = !0) : (H['visible'] = !0, J['visible'] = !1, K['visible'] = !1, d['visible'] = !1, c['visible'] = !1);
                        },
                        q['prototype']['noAutoLipai'] = function () {
                            var f = this['_container_fun']['getChildByName']('btn_autolipai');
                            view['DesktopMgr'].Inst['auto_liqi'] = !0,
                                f['clickHandler'].run();
                        },
                        q['prototype']['resetFunc'] = function () {
                            var f = Laya['LocalStorage']['getItem']('autolipai'),
                                H = !0;
                            H = f && '' != f ? 'true' == f : !0;
                            var N = this['_fun_in']['getChildByName']('btn_autolipai'),
                                Q = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](N, Q, H),
                                Laya['LocalStorage']['setItem']('autolipai', H ? 'true' : 'false'),
                                view['DesktopMgr'].Inst['setAutoLiPai'](H);
                            var D = this['_fun_in']['getChildByName']('btn_autohu'),
                                K = this['_fun_out']['getChildByName']('autohu');
                            this['refreshFuncBtnShow'](D, K, view['DesktopMgr'].Inst['auto_hule']);
                            var b = this['_fun_in']['getChildByName']('btn_autonoming'),
                                I = this['_fun_out']['getChildByName']('autonoming');
                            this['refreshFuncBtnShow'](b, I, view['DesktopMgr'].Inst['auto_nofulu']);
                            var q = this['_fun_in']['getChildByName']('btn_automoqie'),
                                a = this['_fun_out']['getChildByName']('automoqie');
                            this['refreshFuncBtnShow'](q, a, view['DesktopMgr'].Inst['auto_moqie']),
                                this['_container_fun'].x = -546,
                                this['_fun_in']['visible'] = !1,
                                this['_fun_out']['visible'] = !0; {
                                var J = this['_fun_out']['getChildByName']('btn_func');
                                this['_fun_out']['getChildByName']('btn_func2');
                            }
                            J['disabled'] = !1,
                                J['disabled'] = !1;
                        },
                        q['prototype']['setDora'] = function (f, H) {
                            if (0 > f || f >= this['doras']['length'])
                                return console['error']('setDora pos错误'), void 0;
                            var N = 'myres2/mjpm/' + (H['touming'] ? GameMgr.Inst['touming_mjp_view'] : GameMgr.Inst['mjp_surface_view']) + /ui/;
                            this['doras'][f].skin = game['Tools']['localUISrc'](N + H['toString'](!1) + '.png'),
                                this['front_doras'][f]['visible'] = !H['touming'],
                                this['front_doras'][f].skin = game['Tools']['localUISrc']('myres2/mjp/' + GameMgr.Inst['mjp_view'] + '/hand/front.png');
                        },
                        q['prototype']['initRoom'] = function () {
                            var H = this;
                            if (this['_btn_set']['visible'] = !0, view['DesktopMgr'].Inst.mode == view['EMJMode'].play || view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast']) {
                                for (var N = {}, Q = 0; Q < view['DesktopMgr'].Inst['player_datas']['length']; Q++) {
                                    for (var D = view['DesktopMgr'].Inst['player_datas'][Q]['character'], K = D['charid'], b = cfg['item_definition']['character'].find(K).emo, I = 0; 9 > I; I++) {
                                        var q = b + '/' + I['toString']() + '.png';
                                        N[q] = 1;
                                    }
                                    if (D['extra_emoji'])
                                        for (var I = 0; I < D['extra_emoji']['length']; I++) {
                                            var q = b + '/' + D['extra_emoji'][I]['toString']() + '.png';
                                            N[q] = 1;
                                        }
                                }
                                var a = [];
                                for (var J in N)
                                    a.push(J);
                                this['block_emo'].me.x = 1878,
                                    this['block_emo']['reset'](),
                                    game['LoadMgr']['loadResImage'](a, Laya['Handler']['create'](this, function () {
                                        H['block_emo']['initRoom']();
                                    })),
                                    this['_btn_collect']['visible'] = !1;
                            } else if (view['DesktopMgr'].Inst.mode == view['EMJMode']['xinshouyindao'])
                                this['_btn_collect']['visible'] = !1, this['_btn_set']['visible'] = !1;
                            else {
                                for (var k = !1, Q = 0; Q < view['DesktopMgr'].Inst['player_datas']['length']; Q++) {
                                    var r = view['DesktopMgr'].Inst['player_datas'][Q];
                                    if (r && null != r['account_id'] && r['account_id'] == GameMgr.Inst['account_id']) {
                                        k = !0;
                                        break;
                                    }
                                }
                                this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (f['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png')),
                                    this['_btn_collect']['visible'] = k;
                            }
                            if (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, this['_btn_fanzhong'].x = 152, view['DesktopMgr'].Inst.mode == view['EMJMode'].play) {
                                for (var d = 0, Q = 0; Q < view['DesktopMgr'].Inst['player_datas']['length']; Q++) {
                                    var r = view['DesktopMgr'].Inst['player_datas'][Q];
                                    r && null != r['account_id'] && 0 != r['account_id'] && d++;
                                }
                                1 == view['DesktopMgr'].Inst['game_config']['category'] ? (this['_btn_leave']['visible'] = !0, this['_btn_fanzhong']['visible'] = !1, view['DesktopMgr'].Inst['is_chuanma_mode']() && (this['_btn_fanzhong']['visible'] = !0, this['_btn_fanzhong'].x = -92)) : (this['_btn_leave']['visible'] = !1, this['_btn_fanzhong']['visible'] = !0);
                            }
                            for (var X = 0, Q = 0; Q < view['DesktopMgr'].Inst['player_datas']['length']; Q++) {
                                var r = view['DesktopMgr'].Inst['player_datas'][Q];
                                r && null != r['account_id'] && 0 != r['account_id'] && X++;
                            }
                            this['block_emo'].me['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['_container_fun']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                this['enable'] = !0,
                                this['setLiqibang'](0),
                                this['setBen'](0);
                            var _ = this.me['getChildByName']('container_lefttop');
                            if (_['getChildByName']('btn_md5change')['mouseEnabled'] = view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'], view['DesktopMgr'].Inst['is_chuanma_mode']())
                                _['getChildByName']('num_lizhi_0')['visible'] = !1, _['getChildByName']('num_lizhi_1')['visible'] = !1, _['getChildByName']('num_ben_0')['visible'] = !1, _['getChildByName']('num_ben_1')['visible'] = !1, _['getChildByName']('container_doras')['visible'] = !1, _['getChildByName']('gamemode')['visible'] = !1, _['getChildByName']('activitymode')['visible'] = !0, _['getChildByName']('MD5').y = 63, _['getChildByName']('MD5')['width'] = 239, _['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top1.png'), _['getChildAt'](0)['width'] = 280, _['getChildAt'](0)['height'] = 139, 1 == view['DesktopMgr'].Inst['game_config']['category'] ? (_['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !1, _['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !0) : ('en' == GameMgr['client_language'] && (_['getChildByName']('activitymode')['getChildAt'](0).x = 2 == view['DesktopMgr'].Inst['game_config']['category'] ? 77 : 97), _['getChildByName']('activitymode')['getChildAt'](0).text = game['Tools']['strOfLocalization'](2 == view['DesktopMgr'].Inst['game_config']['category'] ? 3393 : 2025), _['getChildByName']('activitymode')['getChildAt'](0)['visible'] = !0, _['getChildByName']('activitymode')['getChildAt'](1)['visible'] = !1);
                            else if (_['getChildByName']('num_lizhi_0')['visible'] = !0, _['getChildByName']('num_lizhi_1')['visible'] = !1, _['getChildByName']('num_ben_0')['visible'] = !0, _['getChildByName']('num_ben_1')['visible'] = !0, _['getChildByName']('container_doras')['visible'] = !0, _['getChildByName']('gamemode')['visible'] = !0, _['getChildByName']('activitymode')['visible'] = !1, _['getChildByName']('MD5').y = 51, _['getChildByName']('MD5')['width'] = 276, _['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/left_top.png'), _['getChildAt'](0)['width'] = 313, _['getChildAt'](0)['height'] = 158, view['DesktopMgr'].Inst['game_config']) {
                                var c = view['DesktopMgr'].Inst['game_config'],
                                    R = game['Tools']['get_room_desc'](c);
                                this['label_gamemode'].text = R.text,
                                    this['container_gamemode']['visible'] = !0;
                            } else
                                this['container_gamemode']['visible'] = !1;
                            if (this['btn_double_pass']['visible'] = view['DesktopMgr'].Inst.mode == view['EMJMode'].play, view['DesktopMgr'].Inst.mode == view['EMJMode'].play)
                                if (this['_network_delay']['begin_refresh'](), this['_network_delay'].me['visible'] = !0, view['DesktopMgr'].Inst['is_jjc_mode']()) {
                                    this['container_jjc']['visible'] = !0,
                                        this['label_jjc_win'].text = f['UI_Activity_JJC']['win_count']['toString']();
                                    for (var Q = 0; 3 > Q; Q++)
                                        this['container_jjc']['getChildByName'](Q['toString']()).skin = game['Tools']['localUISrc']('myres/mjdesktop/tag_jjc_' + (f['UI_Activity_JJC']['lose_count'] > Q ? 'd' : 'l') + '.png');
                                } else
                                    this['container_jjc']['visible'] = !1;
                            else
                                this['_network_delay'].me['visible'] = !1, this['container_jjc']['visible'] = !1;
                            f['UI_Replay'].Inst && (f['UI_Replay'].Inst['pop_collectinput'].me['visible'] = !1);
                            var L = this['_container_fun']['getChildByName']('in')['getChildByName']('btn_automoqie'),
                                o = this['_container_fun']['getChildByName']('out')['getChildByName']('btn_automoqie2');
                            view['DesktopMgr'].Inst['is_zhanxing_mode']() ? (f['UI_Astrology'].Inst.show(), game['Tools']['setGrayDisable'](L, !0), game['Tools']['setGrayDisable'](o, !0)) : (game['Tools']['setGrayDisable'](L, !1), game['Tools']['setGrayDisable'](o, !1), f['UI_Astrology'].Inst.hide());
                            for (var Q = 0; 4 > Q; Q++)
                                this['_player_infos'][Q]['tianming']['visible'] = view['DesktopMgr'].Inst['is_tianming_mode'](), this['_player_infos'][Q]['tianming'].skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx5.png'), this['_player_infos'][Q]['yongchang'].hide();
                        },
                        q['prototype']['onCloseRoom'] = function () {
                            this['_network_delay']['close_refresh']();
                        },
                        q['prototype']['refreshSeat'] = function (f) {
                            void 0 === f && (f = !1);
                            for (var H = (view['DesktopMgr'].Inst.seat, view['DesktopMgr'].Inst['player_datas']), N = 0; 4 > N; N++) {
                                var Q = view['DesktopMgr'].Inst['localPosition2Seat'](N),
                                    D = this['_player_infos'][N];
                                if (0 > Q)
                                    D['container']['visible'] = !1;
                                else {
                                    D['container']['visible'] = !0;
                                    var K = view['DesktopMgr'].Inst['getPlayerName'](Q);
                                    game['Tools']['SetNickname'](D.name, K, !1, !0),
                                        D.head.id = H[Q]['avatar_id'],
                                        D.head['set_head_frame'](H[Q]['account_id'], H[Q]['avatar_frame']);
                                    var b = (cfg['item_definition'].item.get(H[Q]['avatar_frame']), cfg['item_definition'].view.get(H[Q]['avatar_frame']));
                                    if (D.head.me.y = b && b['sargs'][0] ? D['head_origin_y'] - Number(b['sargs'][0]) / 100 * this['head_offset_y'] : D['head_origin_y'], D['avatar'] = H[Q]['avatar_id'], 0 != N) {
                                        var I = H[Q]['account_id'] && 0 != H[Q]['account_id'] && (view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode'].play),
                                            q = H[Q]['account_id'] && 0 != H[Q]['account_id'] && view['DesktopMgr'].Inst.mode == view['EMJMode'].play,
                                            a = view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] || view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'];
                                        f ? D['headbtn']['onChangeSeat'](I, q, a) : D['headbtn']['reset'](I, q, a);
                                    }
                                    D['title'].id = H[Q]['title'] ? game['Tools']['titleLocalization'](H[Q]['account_id'], H[Q]['title']) : 0;
                                }
                            }
                        },
                        q['prototype']['refreshNames'] = function () {
                            for (var f = 0; 4 > f; f++) {
                                var H = view['DesktopMgr'].Inst['localPosition2Seat'](f),
                                    N = this['_player_infos'][f];
                                if (0 > H)
                                    N['container']['visible'] = !1;
                                else {
                                    N['container']['visible'] = !0;
                                    var Q = view['DesktopMgr'].Inst['getPlayerName'](H);
                                    game['Tools']['SetNickname'](N.name, Q, !1, !0);
                                }
                            }
                        },
                        q['prototype']['refreshLinks'] = function () {
                            for (var f = (view['DesktopMgr'].Inst.seat, 0); 4 > f; f++) {
                                var H = view['DesktopMgr'].Inst['localPosition2Seat'](f);
                                view['DesktopMgr'].Inst.mode == view['EMJMode'].play ? this['_player_infos'][f]['disconnect']['visible'] = -1 == H || 0 == f ? !1 : view['DesktopMgr']['player_link_state'][H] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['live_broadcast'] ? this['_player_infos'][f]['disconnect']['visible'] = -1 == H || 0 == view['DesktopMgr'].Inst['player_datas'][H]['account_id'] ? !1 : view['DesktopMgr']['player_link_state'][H] != view['ELink_State']['READY'] : view['DesktopMgr'].Inst.mode == view['EMJMode']['paipu'] && (this['_player_infos'][f]['disconnect']['visible'] = !1);
                            }
                        },
                        q['prototype']['setBen'] = function (f) {
                            f > 99 && (f = 99);
                            var H = this.me['getChildByName']('container_lefttop'),
                                N = H['getChildByName']('num_ben_0'),
                                Q = H['getChildByName']('num_ben_1');
                            f >= 10 ? (N.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](f / 10)['toString']() + '.png'), Q.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (f % 10)['toString']() + '.png'), Q['visible'] = !0) : (N.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (f % 10)['toString']() + '.png'), Q['visible'] = !1);
                        },
                        q['prototype']['setLiqibang'] = function (f, H) {
                            void 0 === H && (H = !0),
                                f > 999 && (f = 999);
                            var N = this.me['getChildByName']('container_lefttop'),
                                Q = N['getChildByName']('num_lizhi_0'),
                                D = N['getChildByName']('num_lizhi_1'),
                                K = N['getChildByName']('num_lizhi_2');
                            f >= 100 ? (K.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (f % 10)['toString']() + '.png'), D.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (Math['floor'](f / 10) % 10)['toString']() + '.png'), Q.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](f / 100)['toString']() + '.png'), D['visible'] = !0, K['visible'] = !0) : f >= 10 ? (D.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + (f % 10)['toString']() + '.png'), Q.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + Math['floor'](f / 10)['toString']() + '.png'), D['visible'] = !0, K['visible'] = !1) : (Q.skin = game['Tools']['localUISrc']('myres/mjdesktop/w_' + f['toString']() + '.png'), D['visible'] = !1, K['visible'] = !1),
                                view['DesktopMgr'].Inst['setRevealScore'](f, H);
                        },
                        q['prototype']['reset_rounds'] = function () {
                            this['closeCountDown'](),
                                this['showscoredeltaing'] = !1,
                                view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            for (var f = 'myres2/mjp/' + GameMgr.Inst['mjp_view'] + /hand/, H = 0; H < this['doras']['length']; H++)
                                if (this['front_doras'][H].skin = '', this['doras'][H].skin = '', view['DesktopMgr'].Inst['is_jiuchao_mode']())
                                    this['front_doras'][H]['visible'] = !1, this['doras'][H].skin = game['Tools']['localUISrc']('myres/mjdesktop/tou_dora_back.png');
                                else {
                                    var N = 'myres2/mjpm/' + GameMgr.Inst['mjp_surface_view'] + /ui/;
                                    this['front_doras'][H]['visible'] = !0,
                                        this['doras'][H].skin = game['Tools']['localUISrc'](N + '5z.png'),
                                        this['front_doras'][H].skin = game['Tools']['localUISrc'](f + 'back.png');
                                }
                            for (var H = 0; 4 > H; H++)
                                this['_player_infos'][H].emo['reset'](), this['_player_infos'][H].que['visible'] = !1;
                            this['_timecd']['reset'](),
                                Laya['timer']['clearAll'](this),
                                Laya['timer']['clearAll'](this['label_md5']),
                                view['DesktopMgr'].Inst['is_chuanma_mode']() || (this['container_doras']['visible'] = !0),
                                this['label_md5']['visible'] = !1;
                        },
                        q['prototype']['showCountDown'] = function (f, H) {
                            this['_timecd']['showCD'](f, H);
                        },
                        q['prototype']['setZhenting'] = function (f) {
                            this['img_zhenting']['visible'] = f;
                        },
                        q['prototype']['shout'] = function (f, H, N, Q) {
                            app.Log.log('shout:' + f + ' type:' + H);
                            try {
                                var D = this['_player_infos'][f],
                                    K = D['container_shout'],
                                    b = K['getChildByName']('img_content'),
                                    I = K['getChildByName']('illust')['getChildByName']('illust'),
                                    q = K['getChildByName']('img_score');
                                if (0 == Q)
                                    q['visible'] = !1;
                                else {
                                    q['visible'] = !0;
                                    var a = 0 > Q ? 'm' + Math.abs(Q) : Q;
                                    q.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_score_' + a + '.png');
                                }
                                '' == H ? b['visible'] = !1 : (b['visible'] = !0, b.skin = game['Tools']['localUISrc']('myres/mjdesktop/shout_' + H + '.png')),
                                    view['DesktopMgr']['is_yuren_type']() && 100 * Math['random']() < 20 ? (K['getChildByName']('illust')['visible'] = !1, K['getChildAt'](2)['visible'] = !0, K['getChildAt'](0)['visible'] = !1, game['LoadMgr']['setImgSkin'](K['getChildAt'](2), 'extendRes/charactor/yurenjie/xg' + Math['floor'](3 * Math['random']()) + '.png')) : (K['getChildByName']('illust')['visible'] = !0, K['getChildAt'](2)['visible'] = !1, K['getChildAt'](0)['visible'] = !0, I['scaleX'] = 1, game['Tools']['charaPart'](N['avatar_id'], I, 'full', D['illustrect'], !0, !0));
                                var J = 0,
                                    k = 0;
                                switch (f) {
                                    case 0:
                                        J = -105,
                                            k = 0;
                                        break;
                                    case 1:
                                        J = 500,
                                            k = 0;
                                        break;
                                    case 2:
                                        J = 0,
                                            k = -300;
                                        break;
                                    default:
                                        J = -500,
                                            k = 0;
                                }
                                K['visible'] = !0,
                                    K['alpha'] = 0,
                                    K.x = D['shout_origin_x'] + J,
                                    K.y = D['shout_origin_y'] + k,
                                    Laya['Tween'].to(K, {
                                        alpha: 1,
                                        x: D['shout_origin_x'],
                                        y: D['shout_origin_y']
                                    }, 70),
                                    Laya['Tween'].to(K, {
                                        alpha: 0
                                    }, 150, null, null, 600),
                                    Laya['timer'].once(800, this, function () {
                                        Laya['loader']['clearTextureRes'](I.skin),
                                            K['visible'] = !1;
                                    });
                            } catch (r) {
                                var d = {};
                                d['error'] = r['message'],
                                    d['stack'] = r['stack'],
                                    d['method'] = 'shout',
                                    d['class'] = 'UI_DesktopInfos',
                                    GameMgr.Inst['onFatalError'](d);
                            }
                        },
                        q['prototype']['closeCountDown'] = function () {
                            this['_timecd']['close']();
                        },
                        q['prototype']['refreshFuncBtnShow'] = function (f, H, N) {
                            var Q = f['getChildByName']('img_choosed');
                            H['color'] = f['mouseEnabled'] ? N ? '#3bd647' : '#7992b3' : '#565656',
                                Q['visible'] = N;
                        },
                        q['prototype']['onShowEmo'] = function (f, H) {
                            var N = this['_player_infos'][f];
                            0 != f && N['headbtn']['emj_banned'] || N.emo.show(f, H);
                        },
                        q['prototype']['changeHeadEmo'] = function (f) {
                            {
                                var H = view['DesktopMgr'].Inst['seat2LocalPosition'](f);
                                this['_player_infos'][H];
                            }
                        },
                        q['prototype']['onBtnShowScoreDelta'] = function () {
                            var f = this;
                            this['showscoredeltaing'] || (this['showscoredeltaing'] = !0, view['DesktopMgr'].Inst['setScoreDelta'](!0), Laya['timer'].once(5000, this, function () {
                                f['showscoredeltaing'] = !1,
                                    view['DesktopMgr'].Inst['setScoreDelta'](!1);
                            }));
                        },
                        q['prototype']['btn_seeinfo'] = function (H) {
                            if (view['DesktopMgr'].Inst.mode != view['EMJMode']['paipu'] && view['DesktopMgr'].Inst.mode != view['EMJMode']['xinshouyindao'] && view['DesktopMgr'].Inst['gameing']) {
                                var N = view['DesktopMgr'].Inst['player_datas'][view['DesktopMgr'].Inst['localPosition2Seat'](H)]['account_id'];
                                if (N) {
                                    var Q = 1 == view['DesktopMgr'].Inst['game_config']['category'],
                                        D = 1,
                                        K = view['DesktopMgr'].Inst['game_config'].meta;
                                    K && K['mode_id'] == game['EMatchMode']['shilian'] && (D = 4);
                                    var b = view['DesktopMgr'].Inst['getPlayerName'](view['DesktopMgr'].Inst['localPosition2Seat'](H));
                                    f['UI_OtherPlayerInfo'].Inst.show(N, view['DesktopMgr'].Inst['game_config'].mode.mode < 10 ? 1 : 2, Q ? 1 : 2, D, b['nickname']);
                                }
                            }
                        },
                        q['prototype']['openDora3BeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dora3_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openPeipaiOpenBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_peipai_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openDora3BeginShine'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_shine'), 'scene/effect_dora3_shine.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](244),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openMuyuOpenBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_muyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openShilianOpenBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_shilian_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openXiuluoOpenBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xiuluo_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openChuanmaBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_chiyu_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openJiuChaoBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_mingjing_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openAnPaiBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_anye_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openTopMatchOpenBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_dianfengduiju_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openZhanxingBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_zhanxing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openTianmingBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_tianming_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['openYongchangBeginEffect'] = function () {
                            var f = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_yongchang_begin_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                            view['AudioMgr']['PlayAudio'](243),
                                Laya['timer'].once(5000, f, function () {
                                    f['destory']();
                                });
                        },
                        q['prototype']['logUpEmoInfo'] = function () {
                            this['block_emo']['sendEmoLogUp'](),
                                this['min_double_time'] = 0,
                                this['max_double_time'] = 0;
                        },
                        q['prototype']['onCollectChange'] = function () {
                            this['_btn_collect']['getChildAt'](0).skin = game['Tools']['localUISrc']('myres/mjdesktop/btn_collect_' + (f['UI_PaiPu']['collect_info'][GameMgr.Inst['record_uuid']] ? 'l.png' : 'd.png'));
                        },
                        q['prototype']['showAIEmo'] = function () {
                            for (var f = this, H = function (H) {
                                var Q = view['DesktopMgr'].Inst['player_datas'][H];
                                Q['account_id'] && 0 != Q['account_id'] || Math['random']() < 0.3 && Laya['timer'].once(500 + 1000 * Math['random'](), N, function () {
                                    f['onShowEmo'](view['DesktopMgr'].Inst['seat2LocalPosition'](H), Math['floor'](9 * Math['random']()));
                                });
                            }, N = this, Q = 0; Q < view['DesktopMgr'].Inst['player_datas']['length']; Q++)
                                H(Q);
                        },
                        q['prototype']['setGapType'] = function (f, H) {
                            void 0 === H && (H = !1);
                            for (var N = 0; N < f['length']; N++) {
                                var Q = view['DesktopMgr'].Inst['seat2LocalPosition'](N);
                                this['_player_infos'][Q].que['visible'] = !0,
                                    H && (0 == N ? (this['_player_infos'][Q].que.pos(this['gapStartPosLst'][N].x + this['selfGapOffsetX'][f[N]], this['gapStartPosLst'][N].y), this['_player_infos'][Q].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][Q].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][Q]['que_target_pos'].x,
                                        y: this['_player_infos'][Q]['que_target_pos'].y
                                    }, 200)) : (this['_player_infos'][Q].que.pos(this['gapStartPosLst'][N].x, this['gapStartPosLst'][N].y), this['_player_infos'][Q].que['scale'](1, 1), Laya['Tween'].to(this['_player_infos'][Q].que, {
                                        scaleX: 0.35,
                                        scaleY: 0.35,
                                        x: this['_player_infos'][Q]['que_target_pos'].x,
                                        y: this['_player_infos'][Q]['que_target_pos'].y
                                    }, 200))),
                                    this['_player_infos'][Q].que.skin = game['Tools']['localUISrc']('myres/mjdesktop/dingque_' + f[N] + '.png');
                            }
                        },
                        q['prototype']['OnNewCard'] = function (f, H) {
                            if (H) {
                                var N = game['FrontEffect'].Inst['create_ui_effect'](this.me['getChildByName']('container_effects')['getChildByName']('dora3_begin'), 'scene/effect_xianjing_' + GameMgr['client_language'] + '.lh', new Laya['Point'](0, 0), 1);
                                view['AudioMgr']['PlayAudio'](243),
                                    Laya['timer'].once(5000, N, function () {
                                        N['destory']();
                                    }),
                                    Laya['timer'].once(1300, this, function () {
                                        this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !0);
                                    });
                            } else
                                this['ShowSpellCard'](view['DesktopMgr'].Inst['field_spell'], !1);
                        },
                        q['prototype']['ShowSpellCard'] = function (H, N) {
                            void 0 === N && (N = !1),
                                f['UI_FieldSpell'].Inst && !f['UI_FieldSpell'].Inst['enable'] && f['UI_FieldSpell'].Inst.show(H, N);
                        },
                        q['prototype']['HideSpellCard'] = function () {
                            f['UI_FieldSpell'].Inst && f['UI_FieldSpell'].Inst['close']();
                        },
                        q['prototype']['SetTianMingRate'] = function (f, H, N) {
                            void 0 === N && (N = !1);
                            var Q = view['DesktopMgr'].Inst['seat2LocalPosition'](f),
                                D = this['_player_infos'][Q]['tianming'];
                            N && 5 != H && D.skin != game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + H + '.png') && Laya['Tween'].to(D, {
                                scaleX: 1.1,
                                scaleY: 1.1
                            }, 200, null, Laya['Handler']['create'](this, function () {
                                Laya['Tween'].to(D, {
                                    scaleX: 1,
                                    scaleY: 1
                                }, 200);
                            })),
                                D.skin = game['Tools']['localUISrc']('myres/mjdesktop/tianmingx' + H + '.png');
                        },
                        q['prototype']['ResetYongChang'] = function () {
                            for (var f = 0; 4 > f; f++)
                                this['_player_infos'][f]['yongchang']['resetToStart']();
                        },
                        q['prototype']['SetYongChangRate'] = function (f, H, N, Q, D, K) {
                            this['_player_infos'][f]['yongchang'].show(H, N, Q, D, K);
                        },
                        q.Inst = null,
                        q;
                }
                    (f['UIBase']);
            f['UI_DesktopInfo'] = I;
        }
            (uiscript || (uiscript = {}));








        uiscript.UI_Info.Init = function () {
            // 设置名称
            if (MMP.settings.nickname != '') {
                GameMgr.Inst.account_data.nickname = MMP.settings.nickname;
            }
            // END
            var H = this,
                N = 'en' == GameMgr['client_type'] && 'kr' == GameMgr['client_language'] ? 'us-kr' : GameMgr['client_language'];
            this['read_list'] = [],
                app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchAnnouncement', {
                    lang: N,
                    platform: GameMgr['inDmm'] ? 'web_dmm' : 'web'
                }, function (N, Q) {
                    N || Q['error'] ? f['UIMgr'].Inst['showNetReqError']('fetchAnnouncement', N, Q) : H['_refreshAnnouncements'](Q);
                    // START
                    if ((N || Q['error']) === null) {
                        if (MMP.settings.isReadme == false || MMP.settings.version != GM_info['script']['version']) {
                            uiscript.UI_Info.Inst.show();
                            MMP.settings.isReadme = true;
                            MMP.settings.version = GM_info['script']['version'];
                            MMP.saveSettings();
                        }
                    }
                    // END
                }),
                app['NetAgent']['AddListener2Lobby']('NotifyAnnouncementUpdate', Laya['Handler']['create'](this, function (f) {
                    for (var Q = GameMgr['inDmm'] ? 'web_dmm' : 'web', D = 0, K = f['update_list']; D < K['length']; D++) {
                        var b = K[D];
                        if (b.lang == N && b['platform'] == Q) {
                            H['have_new_notice'] = !0;
                            break;
                        }
                    }
                }, null, !1));
        }





        uiscript.UI_Info._refreshAnnouncements = function (f) {
            // START
            f.announcements.splice(0, 0, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(readme.replace(/-/g, '=')))), 'id': 666666, 'title': '[雀魂mod_plus]\n使用须知' }, { 'content': bf.trimZeros(bf.decrypt(bf.base64Decode(update_info.replace(/-/g, '=')))), 'id': 777777, 'title': '[雀魂mod_plus]\n更新日志' })
            // END
            if (f['announcements'] && (this['announcements'] = f['announcements']), f.sort && (this['announcement_sort'] = f.sort), f['read_list']) {
                this['read_list'] = [];
                for (var H = 0; H < f['read_list']['length']; H++)
                    this['read_list'].push(f['read_list'][H]);
                this.read_list.splice(0, 0, 666666, 777777);
            }
        }








        // 加载CG 
        !function (f) {
            var H = function () {
                function H(H, N) {
                    var Q = this;
                    this['cg_id'] = 0,
                        this.me = H,
                        this['father'] = N;
                    var D = this.me['getChildByName']('btn_detail');
                    D['clickHandler'] = new Laya['Handler'](this, function () {
                        f['UI_Bag'].Inst['locking'] || Q['father']['changeLoadingCG'](Q['cg_id']);
                    }),
                        game['Tools']['setButtonLongPressHandler'](D, new Laya['Handler'](this, function (H) {
                            if (!f['UI_Bag'].Inst['locking']) {
                                'down' == H ? Laya['timer'].once(800, Q, function () {
                                    f['UI_CG_Yulan'].Inst.show(Q['cg_id']);
                                }) : ('over' == H || 'up' == H) && Laya['timer']['clearAll'](Q);
                            }
                        })),
                        this['using'] = D['getChildByName']('using'),
                        this.icon = D['getChildByName']('icon'),
                        this.name = D['getChildByName']('name'),
                        this.info = D['getChildByName']('info'),
                        this['label_time'] = this.info['getChildByName']('info'),
                        this['sprite_new'] = D['getChildByName']('new');
                }
                return H['prototype'].show = function () {
                    this.me['visible'] = !0;
                    var H = cfg['item_definition']['loading_image'].get(this['cg_id']);
                    this['using']['visible'] = -1 != f['UI_Loading']['Loading_Images']['indexOf'](this['cg_id']),
                        game['LoadMgr']['setImgSkin'](this.icon, H['thumb_path'], null, 'UI_Bag_PageCG');
                    for (var N = !this['father']['last_seen_cg_map'][this['cg_id']], Q = 0, D = H['unlock_items']; Q < D['length']; Q++) {
                        var K = D[Q];
                        if (K && f['UI_Bag']['get_item_count'](K) > 0) {
                            var b = cfg['item_definition'].item.get(K);
                            if (this.name.text = b['name_' + GameMgr['client_language']], !b['item_expire']) {
                                this.info['visible'] = !1,
                                    N = -1 != this['father']['new_cg_ids']['indexOf'](K);
                                break;
                            }
                            this.info['visible'] = !0,
                                this['label_time'].text = game['Tools']['strOfLocalization'](3119) + b['expire_desc_' + GameMgr['client_language']];
                        }
                    }
                    this['sprite_new']['visible'] = N;
                },
                    H['prototype']['reset'] = function () {
                        game['LoadMgr']['clearImgSkin'](this.icon),
                            Laya['Loader']['clearTextureRes'](this.icon.skin);
                    },
                    H;
            }
                (),
                N = function () {
                    function N(H) {
                        var N = this;
                        this['seen_cg_map'] = null,
                            this['last_seen_cg_map'] = null,
                            this['new_cg_ids'] = [],
                            this.me = H,
                            this['scrollview'] = this.me['scriptMap']['capsui.CScrollView'],
                            this['scrollview']['init_scrollview'](new Laya['Handler'](this, this['render_item']), null, 3),
                            this['no_info'] = this.me['getChildByName']('no_info'),
                            this.head = this.me['getChildByName']('head');
                        var Q = this.me['getChildByName']('choose');
                        this['label_choose_all'] = Q['getChildByName']('tip'),
                            Q['clickHandler'] = new Laya['Handler'](this, function () {
                                if (N['all_choosed'])
                                    f['UI_Loading']['Loading_Images'] = [];
                                else {
                                    f['UI_Loading']['Loading_Images'] = [];
                                    for (var H = 0, Q = N['items']; H < Q['length']; H++) {
                                        var D = Q[H];
                                        f['UI_Loading']['Loading_Images'].push(D.id);
                                    }
                                }
                                N['scrollview']['wantToRefreshAll'](),
                                    N['refreshChooseState']();
                                // START
                                //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                                //    images: f['UI_Loading']['Loading_Images']
                                //}, function (H, N) {
                                //    (H || N['error']) && f['UIMgr'].Inst['showNetReqError']('setLoadingImage', H, N);
                                //});
                                // END
                            });
                    }
                    return N['prototype']['have_redpoint'] = function () {
                        // START
                        //if (f['UI_Bag']['new_cg_ids']['length'] > 0)
                        //    return !0;
                        // END
                        var H = [];
                        if (!this['seen_cg_map']) {
                            var N = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                            if (this['seen_cg_map'] = {}, N) {
                                N = game['Tools']['dddsss'](N);
                                for (var Q = N['split'](','), D = 0; D < Q['length']; D++)
                                    this['seen_cg_map'][Number(Q[D])] = 1;
                            }
                        }
                        cfg['item_definition']['loading_image']['forEach'](function (N) {
                            if (N['unlock_items'][1] && 0 == f['UI_Bag']['get_item_count'](N['unlock_items'][0]) && f['UI_Bag']['get_item_count'](N['unlock_items'][1]) > 0) {
                                if (GameMgr['regionLimited']) {
                                    var Q = cfg['item_definition'].item.get(N['unlock_items'][1]);
                                    if (1 == Q['region_limit'])
                                        return;
                                }
                                H.push(N.id);
                            }
                        });
                        for (var K = 0, b = H; K < b['length']; K++) {
                            var I = b[K];
                            if (!this['seen_cg_map'][I])
                                return !0;
                        }
                        return !1;
                    },
                        N['prototype'].show = function () {
                            var H = this;
                            if (this['new_cg_ids'] = f['UI_Bag']['new_cg_ids'], f['UI_Bag']['removeAllCGNew'](), this['scrollview']['reset'](), this['items'] = [], !this['seen_cg_map']) {
                                var N = Laya['LocalStorage']['getItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']));
                                if (this['seen_cg_map'] = {}, N) {
                                    N = game['Tools']['dddsss'](N);
                                    for (var Q = N['split'](','), D = 0; D < Q['length']; D++)
                                        this['seen_cg_map'][Number(Q[D])] = 1;
                                }
                            }
                            this['last_seen_cg_map'] = this['seen_cg_map'];
                            var K = '';
                            cfg['item_definition']['loading_image']['forEach'](function (N) {
                                for (var Q = 0, D = N['unlock_items']; Q < D['length']; Q++) {
                                    var b = D[Q];
                                    if (b && f['UI_Bag']['get_item_count'](b) > 0) {
                                        var I = cfg['item_definition'].item.get(b);
                                        if (1 == I['region_limit'] && GameMgr['regionLimited'])
                                            continue;
                                        return H['items'].push(N),
                                            H['seen_cg_map'][N.id] = 1,
                                            '' != K && (K += ','),
                                            K += N.id,
                                            void 0;
                                    }
                                }
                            }),
                                this['items'].sort(function (f, H) {
                                    return H.sort - f.sort;
                                }),
                                Laya['LocalStorage']['setItem'](game['Tools']['eeesss']('bag_cg_list_' + GameMgr.Inst['account_id']), game['Tools']['eeesss'](K)),
                                f['UI_Bag'].Inst['refreshRedpoint'](),
                                this.me['visible'] = !0,
                                this.me['getChildByName']('choose')['visible'] = 0 != this['items']['length'],
                                this['scrollview']['addItem'](this['items']['length']),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !0),
                                this['no_info']['visible'] = 0 == this['items']['length'],
                                this.head['visible'] = 0 != this['items']['length'],
                                this['_changed'] = !1,
                                this['refreshChooseState']();
                        },
                        N['prototype']['close'] = function () {
                            this.me['visible'] = !1,
                                this['items'] = [],
                                this['scrollview']['reset'](),
                                game['TempImageMgr']['setUIEnable']('UI_Bag_PageCG', !1),
                                this['_changed'] && f['UI_Loading']['loadNextCG']();
                        },
                        N['prototype']['render_item'] = function (f) {
                            var N = f['index'],
                                Q = f['container'],
                                D = f['cache_data'];
                            if (this['items'][N]) {
                                D.item || (D.item = new H(Q, this));
                                var K = D.item;
                                K['cg_id'] = this['items'][N].id,
                                    K.show();
                            }
                        },
                        N['prototype']['changeLoadingCG'] = function (H) {
                            this['_changed'] = !0;
                            for (var N = 0, Q = 0, D = 0, K = this['items']; D < K['length']; D++) {
                                var b = K[D];
                                if (b.id == H) {
                                    N = Q;
                                    break;
                                }
                                Q++;
                            }
                            var I = f['UI_Loading']['Loading_Images']['indexOf'](H);
                            -1 == I ? f['UI_Loading']['Loading_Images'].push(H) : f['UI_Loading']['Loading_Images']['splice'](I, 1),
                                this['scrollview']['wantToRefreshItem'](N),
                                this['refreshChooseState'](),
                                // START
                                MMP.settings.loadingCG = f['UI_Loading']['Loading_Images'];
                            MMP.saveSettings();
                            //app['NetAgent']['sendReq2Lobby']('Lobby', 'setLoadingImage', {
                            //    images: f['UI_Loading']['Loading_Images']
                            //}, function (H, N) {
                            //    (H || N['error']) && f['UIMgr'].Inst['showNetReqError']('setLoadingImage', H, N);
                            //});
                            // END
                        },
                        N['prototype']['refreshChooseState'] = function () {
                            this['all_choosed'] = f['UI_Loading']['Loading_Images']['length'] == this['items']['length'],
                                this['label_choose_all'].text = game['Tools']['strOfLocalization'](this['all_choosed'] ? 3916 : 3915);
                        },
                        N['prototype']['when_update_data'] = function () {
                            this['scrollview']['wantToRefreshAll']();
                        },
                        N;
                }
                    ();
            f['UI_Bag_PageCG'] = N;
        }
            (uiscript || (uiscript = {}));

        // 懒b作者终于修复了对局结束变婚皮的问题 
        uiscript.UI_MJReward.prototype.show = function (H) {
            // START
            view['DesktopMgr'].Inst['rewardinfo']['main_character'] = {
                "level": 5,
                "exp": 0,
                "add": 0
            }
            var f = uiscript;
            // END
            var N = this,
                Q = view['DesktopMgr'].Inst['rewardinfo'];
            this['page_jiban'].me['visible'] = !1,
                this['page_jiban_gift'].me['visible'] = !1,
                this['complete'] = H,
                this['page_box'].show(),
                f['UIBase']['anim_alpha_in'](this['page_box'].me, {
                    x: -50
                }, 150),
                Q['main_character'] ? (this['page_jiban'].show(), f['UIBase']['anim_alpha_in'](this['page_jiban'].me, {
                    x: -50
                }, 150, 60)) : Q['character_gift'] && (this['page_jiban_gift'].show(), f['UIBase']['anim_alpha_in'](this['page_jiban_gift'].me, {
                    x: -50
                }, 150, 60)),
                Laya['timer'].once(600, this, function () {
                    var f = 0;
                    N['page_box']['doanim'](Laya['Handler']['create'](N, function () {
                        f++,
                            2 == f && N['showGrade'](H);
                    })),
                        Q['main_character'] ? N['page_jiban']['doanim'](Laya['Handler']['create'](N, function () {
                            f++,
                                2 == f && N['showGrade'](H);
                        })) : Q['character_gift'] ? N['page_jiban_gift']['doanim'](Laya['Handler']['create'](N, function () {
                            f++,
                                2 == f && N['showGrade'](H);
                        })) : (f++, 2 == f && N['showGrade'](H));
                }),
                this['enable'] = !0;
        }





        uiscript.UI_Entrance.prototype._onLoginSuccess = function (H, N, Q) {
            var f = uiscript;
            var D = this;
            if (void 0 === Q && (Q = !1), app.Log.log('登陆：' + JSON['stringify'](N)), GameMgr.Inst['account_id'] = N['account_id'], GameMgr.Inst['account_data'] = N['account'], f['UI_ShiMingRenZheng']['renzhenged'] = N['is_id_card_authed'], GameMgr.Inst['account_numerical_resource'] = {}, N['account']['platform_diamond'])
                for (var K = N['account']['platform_diamond'], b = 0; b < K['length']; b++)
                    GameMgr.Inst['account_numerical_resource'][K[b].id] = K[b]['count'];
            if (N['account']['skin_ticket'] && (GameMgr.Inst['account_numerical_resource']['100004'] = N['account']['skin_ticket']), N['account']['platform_skin_ticket'])
                for (var I = N['account']['platform_skin_ticket'], b = 0; b < I['length']; b++)
                    GameMgr.Inst['account_numerical_resource'][I[b].id] = I[b]['count'];
            GameMgr.Inst['account_refresh_time'] = Laya['timer']['currTimer'],
                N['game_info'] && (GameMgr.Inst['ingame'] = !0, GameMgr.Inst['mj_server_location'] = N['game_info']['location'], GameMgr.Inst['mj_game_token'] = N['game_info']['connect_token'], GameMgr.Inst['mj_game_uuid'] = N['game_info']['game_uuid']),
                N['access_token'] && (Laya['LocalStorage']['setItem']('_pre_sociotype', 'false' == Laya['LocalStorage']['getItem']('autologin') ? '' : H['toString']()), Laya['LocalStorage']['setItem']('ssssoooodd', N['access_token']), GameMgr.Inst['sociotype'] = H, GameMgr.Inst['access_token'] = N['access_token']);
            var q = this,
                a = function () {
                    GameMgr.Inst['onLoadStart']('login'),
                        Laya['LocalStorage']['removeItem']('__ad_s'),
                        f['UI_Loading'].Inst.show('load_lobby'),
                        q['enable'] = !1,
                        q['scene']['close'](),
                        f['UI_Entrance_Mail_Regist'].Inst['close'](),
                        q['login_loading']['close'](),
                        f['UIMgr'].Inst['openLobbyUI'](Laya['Handler']['create'](q, function () {
                            GameMgr.Inst['afterLogin'](),
                                q['route_info']['onClose'](),
                                GameMgr.Inst['account_data']['anti_addiction'] && f['UIMgr'].Inst['ShowPreventAddiction'](),
                                q['destroy'](),
                                q['disposeRes'](),
                                f['UI_Add2Desktop'].Inst && (f['UI_Add2Desktop'].Inst['destroy'](), f['UI_Add2Desktop'].Inst = null);
                        }), Laya['Handler']['create'](q, function (H) {
                            return f['UI_Loading'].Inst['setProgressVal'](0.2 * H);
                        }, null, !1));
                },
                J = Laya['Handler']['create'](this, function () {
                    0 != GameMgr.Inst['account_data']['frozen_state'] ? app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchRefundOrder', {}, function (H, N) {
                        H ? (app.Log.log('fetchRefundOrder err:' + H), D['showError'](game['Tools']['strOfLocalization'](2061), H), D['showContainerLogin']()) : (f['UI_Refund']['orders'] = N['orders'], f['UI_Refund']['clear_deadline'] = N['clear_deadline'], f['UI_Refund']['message'] = N['message'], a());
                    }) : a();
                });
            // START
            //if (f['UI_Loading']['Loading_Images'] = [], GameMgr.Inst['account_data']['loading_image'])
            //    for (var k = 0, r = GameMgr.Inst['account_data']['loading_image']; k < r['length']; k++) {
            //        var d = r[k];
            //        cfg['item_definition']['loading_image'].get(d) && f['UI_Loading']['Loading_Images'].push(d);
            //    }
            uiscript.UI_Loading.Loading_Images = MMP.settings.loadingCG;
            // END
            f['UI_Loading']['loadNextCG'](),
                'chs' != GameMgr['client_type'] || N['account']['phone_verify'] ? J.run() : (f['UI_Entrance_Mail_Regist'].Inst['close'](), this['login_loading']['close'](), this['container_login']['visible'] = !1, f['UI_Bind_Phone1'].Inst.show(!0, Laya['Handler']['create'](this, function () {
                    app['NetAgent']['sendReq2Lobby']('Lobby', 'fetchPhoneLoginBind', {}, function (H, N) {
                        H || N['error'] ? D['showError'](H, N['error']) : 0 == N['phone_login'] ? f['UI_Create_Phone_Account'].Inst.show(J) : f['UI_Canot_Create_Phone_Account'].Inst.show(J);
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
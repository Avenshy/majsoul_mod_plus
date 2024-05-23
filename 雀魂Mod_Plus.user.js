// ==UserScript==
// @name         雀魂Mod_Plus
// @name:zh-TW   雀魂Mod_Plus
// @name:zh-HK   雀魂Mod_Plus
// @name:en      MajsoulMod_Plus
// @name:ja      雀魂Mod_Plus
// @namespace    https://github.com/Avenshy
// @version      1.0
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
// @grant        GM_openInTab
// @connect      localhost
// @license      GPL-3.0
// ==/UserScript==


(function() {
    'use strict';
    let message = '\t由于油猴脚本更新频繁且麻烦，且兼容性差，极易被封号，现在已停止维护油猴脚本，所有功能已经删除。\n\
\t如需继续使用全解锁和其他功能，请移步至MajsoulMax，支持网页和客户端，更好用、更方便、更安全，目前正在绝赞更新中！\n\
\thttps://github.com/Avenshy/MajsoulMax \n\n\
\t感谢你的支持！\n\
\tby Avenshy 2024/05/23';
    console.log(message);
    alert(message);
    GM_openInTab('https://github.com/Avenshy/MajsoulMax',false);
    // Your code here...
})();
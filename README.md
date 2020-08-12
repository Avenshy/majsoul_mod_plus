# 雀魂mod_plus  
雀魂解锁全角色、皮肤、道具等。  
Github: [雀魂mod_plus](https://github.com/Avenshy/majsoul_mod_plus)  
Greasyfork: [雀魂mod_plus](https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus)  
## 简介  
原作者代码地址：[雀魂mod](https://github.com/UsernameFull/majsoul_mod)，年久失修，已无法使用，本项目修复了原作者的代码并增加一些新功能。  
欢迎反馈BUG！  
顺便吐槽一句，这代码也太长了，明明能精简很多的……( ´д`)  
>注意：解锁人物仅在本地有效，别人还是只能看到你原来的角色。<br/>
魔改千万条，安全第一条。<br/>
使用不规范，账号两行泪。<br/>  
  
>本插件仅供学习参考交流，请使用者于下载24小时内自行删除，不得用于商业用途，否则后果自负。  
  
  
### 当前功能  
- 解锁所有角色与皮肤  
- 解锁所有装扮  
- 解锁所有道具  
- 解锁所有语音
- 解锁所有称号 `(v0.2 New)`  
  
  
## 使用说明   
### 安装  
1. 浏览器安装Tampermonkey插件  
2. 在[Github](https://github.com/Avenshy/majsoul_mod_plus)或[Greasyfork](https://greasyfork.org/zh-CN/scripts/408051-%E9%9B%80%E9%AD%82mod-plus)安装脚本  
  
### 修改默认装扮  
1. 修改脚本的ID变量  
2. 保存并刷新  
  
### 查询ID  
1. F12打开控制台
2. 输入对应的代码并按下回车  
  
- 所有物品 `cfg.item_definition.item.map_`  
- 所有角色 `cfg.item_definition.character.map_`  
- 所有皮肤 `cfg.item_definition.skin.map_`
- 所有称号 `cfg.item_definition.title.map_`
  
![image](https://raw.githubusercontent.com/Avenshy/majsoul_mod_plus/master/preview1.png)
![image](https://raw.githubusercontent.com/Avenshy/majsoul_mod_plus/master/preview2.png)
   
## 已知BUG  
暂无，欢迎反馈~(〃∀〃)  

  
## 更新日志  
  
### `v0.3` `(2020/8/12 > Majsoul v0.8.82w )`  
* 修复了友人房给房主换装的BUG，友人房现在应该没有BUG了  
* 保存设置的方式改为GM_setValue和GM_getValue，cookie作为备用方式  
* 现在能够保存各角色使用的皮肤、正在使用的装扮页和所有装扮，不再需要在脚本中手动修改设置  
* 去除因传记产生的小红点  
* 修复进入游戏时，“试炼之道”活动中“试炼积分”为1的BUG  
* 修复表情丢失的BUG，但是如果原本就没有该表情的话，也是不能发送的  
* 增加外服支持，可能有水土不服  
* 增加暂不开放的功能：强制打开便捷提示、保存每局状态（自动理牌、自动和了、不吃碰杠、自动摸切）  
* 应该还有，但是忘了，就这样吧
 
  
### `v0.21` `(2020/8/05 > Majsoul v0.8.82w )`  
* 修复“友人房对局结束后会直接回到主页”的BUG，sorry my bad(つд⊂)  
  
  
### `v0.2` `(2020/8/05 > Majsoul v0.8.82w )`  
* 修复特效不生效的BUG  
* 修复友人房换装无效的BUG  
* 增加解锁全称号  
* 修改了代码，脚本不会一直循环运行了  
* 增加新BUG(*´д`) (友人房对局结束后会直接回到主页)  
  
  
### `v0.1` `(2020/8/02 > Majsoul v0.8.82w )`  
* 发布第一个版本  

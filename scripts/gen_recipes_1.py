#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate SQL UPDATE statements with Chinese cooking recipes for batch_1 dishes."""

import json
import os

# Specific recipe overrides for well-known dishes (keyed by dish id)
SPECIFIC_RECIPES = {
    # === Anhui ===
    "anhui_anqing_jitang_paochaomi": "1.老母鸡洗净放入砂锅，加足量清水大火烧开后转小火慢炖三小时，熬出浓白鸡汤。2.碗中放入炒米和葱花，冲入滚烫鸡汤，搅拌均匀即可食用。",
    "anhui_bengbu_shaobing": "1.面粉和成面团醒发，猪里脊切片用孜然和辣椒腌制入味。2.面团擀成薄饼，贴入烤炉中烤至鼓起金黄。3.里脊片入油锅炸熟，夹入烤饼中，刷上辣酱即成。",
    "anhui_bozhou_niurou_mo": "1.牛肉切丁加粉丝和辣椒调成馅料，面粉和成软面团醒发。2.面团擀成大圆饼，铺上牛肉馅料包好，按扁成馍状。3.放入平底锅中烙至两面金黄，再入烤箱烤熟即成。",
    "anhui_chaohu_yu": "1.银鱼洗净沥干，鸡蛋打散，葱姜切末备用。2.银鱼加蛋液、葱姜、少许盐搅拌均匀。3.锅中热油，倒入银鱼蛋液，小火慢煎至两面金黄，出锅装盘。",
    "anhui_chizhou_xiaoba": "1.猪肉末加梅干菜和辣椒拌成馅料，面粉和成面团醒发。2.面团分成小剂子，包入馅料擀成圆饼状。3.放入烤炉中烤至两面金黄酥脆，取出即成。",
    "anhui_chou_guiyu": "1.鳜鱼用淡盐水腌制发酵至微臭，取出洗净沥干。2.锅中热油，放入鳜鱼煎至两面微黄，加笋片、肉片、红辣椒同烧。3.加入酱油、料酒和适量水，小火慢烧至汤汁浓稠即成。",
    "anhui_chuzhou_guanba_niurou": "1.牛腱肉冷水下锅焯去血沫，捞出洗净。2.锅中加水、酱油、八角、桂皮，放入牛肉大火烧开转小火卤煮两小时。3.捞出放凉后切薄片，淋上卤汁即可食用。",
    "anhui_fuyang_gelatiao": "1.面粉加水和成较硬面团，用专用器具压成粗面条状。2.下入沸水中煮熟捞出，沥干水分盛入碗中。3.加入芝麻酱、辣椒油、豆芽拌匀即可食用。",
    "anhui_hefei_xiaolongxia": "1.小龙虾刷洗干净，剪去虾须，沥干水分备用。2.锅中热油，放入蒜和辣椒爆香，倒入小龙虾大火翻炒至变色。3.加入啤酒和调料，盖盖焖煮十分钟，大火收汁即成。",
    "anhui_huaibei_mianpi": "1.面粉加水洗出面筋，面浆沉淀后上锅蒸成薄面皮。2.面皮放凉后切成条状，面筋也蒸熟切块。3.加入芝麻酱、辣椒油、醋、蒜水拌匀即可食用。",
    "anhui_huainan_doufu": "1.豆腐切块，虾仁和香菇洗净备用，鸡汤烧开。2.将豆腐放入鸡汤中，加入虾仁和香菇同煮。3.大火烧开后转小火炖至豆腐入味，加盐调味出锅。",
    "anhui_huangshan_shancha": "1.取黄山山茶适量放入茶壶中。2.用八十度左右的热水冲泡，第一泡洗茶倒掉。3.再次冲入热水，浸泡一两分钟后倒入茶杯即可品饮。",
    "anhui_huangshan_shancha_jidan": "1.鸡蛋煮熟后轻轻敲裂蛋壳备用。2.锅中加水，放入茶叶、八角、桂皮、酱油煮开成卤水。3.放入鸡蛋小火煮半小时，关火浸泡数小时入味即成。",
    "anhui_huangshan_shaobing": "1.梅干菜泡发切碎，猪肉剁碎，加调料拌成馅料。2.面粉和成面团，分成小剂子包入馅料，擀成薄饼，撒上芝麻。3.贴入烤炉内壁，烤至金黄酥脆即成。",
    "anhui_huangshan_tunxi_maojitou": "1.豆腐切块放在竹匾上，自然发酵至表面长出白色绒毛。2.平底锅中倒入菜籽油，放入毛豆腐小火煎至两面金黄。3.出锅后蘸辣椒酱食用。",
    "anhui_huizhou_maojian": "1.取黄山毛峰茶叶适量放入玻璃杯中。2.用八十度左右热水冲泡，水量约杯子三分之一。3.待茶叶舒展开后再次注水，即可品饮清香绿茶。",
    "anhui_jixi_take": "1.猪肉、笋和豆腐干切丁炒成馅料，加辣椒调味。2.面粉和成面团，分成小剂子擀成薄皮，包入馅料捏成粿状。3.放入平底锅中，小火烙至两面金黄即成。",
    "anhui_lihongzhang_dazahui": "1.鸡肉、海参、鱼肚、火腿分别处理好切块，鸽蛋煮熟备用。2.所有食材放入砂锅，加清汤大火烧开。3.转小火慢炖至各种食材软烂入味，加白菜煮熟调味即成。",
    "anhui_liuan_guapian": "1.取六安瓜片茶叶放入杯中。2.用八十度热水冲泡，第一泡快速倒掉洗茶。3.再次注水冲泡两分钟，待叶片完全舒展后即可品饮。",
    "anhui_mao_doufu": "1.豆腐切块放置发酵至表面长出白色菌毛。2.平底锅中倒入菜籽油烧热，放入毛豆腐煎至两面金黄酥脆。3.出锅装盘，蘸辣椒酱食用。",
    "anhui_mengcheng_yousu_shaobing": "1.面粉加猪油和成油酥面团，再用面粉和水和成水油面团。2.两种面团分别擀开叠起，撒上葱花和花椒盐，卷起分段擀成饼状。3.放入烤炉中烤至金黄酥脆即成。",
    "anhui_sanhe_mijiao": "1.猪肉和豆腐切丁炒熟成馅料，加葱调味。2.籼米粉加热水揉成面团，分成小份擀成皮，包入馅料捏成饺子状。3.放入热油锅中炸至金黄酥脆，捞出沥油即成。",
    "anhui_suzhou_sa_tang": "1.老母鸡洗净放入锅中，加麦仁和清水大火烧开。2.转小火慢煮至鸡肉酥烂、麦仁开花。3.打入鸡蛋搅散，加胡椒粉和盐调味，撒上香菜即成。",
    "anhui_taihe_banmian": "1.宽面下入沸水中煮熟捞出盛碗。2.另起锅热油，放入辣椒和牛肉翻炒出香，加水煮成汤底。3.汤底浇在面上，放入烫熟的青菜即可食用。",
    "anhui_tongling_sutang": "1.芝麻炒熟擀碎，面粉炒至微黄，加入白糖和桂花拌匀。2.混合料放入模具中压实成型。3.取出切块，即成酥脆香甜的酥糖。",
    "anhui_wuhu_xiazi_mian": "1.虾籽用小火焙香备用，酱油和猪油调成底汤。2.面条下入沸水中煮熟，捞出放入调好底汤的碗中。3.撒上虾籽和葱花，拌匀即可食用。",
    "anhui_wuhu_zha_rou_zheng_fan": "1.猪肉切块用酱油和调料腌制，裹上米粉拌匀。2.红薯切块铺在蒸碗底部，上面放上米粉肉，再铺一层米饭。3.放入蒸锅大火蒸一小时至肉烂米粉软糯即成。",
    "anhui_xuancheng_banli": "1.鸡肉切块焯水去腥，板栗去壳备用。2.锅中炒化冰糖至起泡，放入鸡块翻炒上色，加酱油调味。3.放入板栗和适量水，小火慢烧至鸡肉酥烂、板栗软糯即成。",
    "anhui_xuancheng_suan_sun": "1.五花肉切块焯水，笋干泡发切段备用。2.锅中炒化冰糖，放入五花肉翻炒上色，加酱油调味。3.放入笋干和适量水，小火慢烧至肉烂笋香，大火收汁即成。",
    "anhui_yipin_guo": "1.鸡肉、猪肉切块，豆腐煎至两面金黄，笋干泡发切段。2.所有食材分层码入铁锅中，加适量水和调料。3.大火烧开后转小火慢炖至所有食材软烂入味即成。",

    # === Beijing ===
    "beijing_aiwowo": "1.糯米蒸熟捣烂成团备用。2.取小块糯米团按扁，包入用芝麻、核桃仁和白糖拌成的馅料。3.收口搓圆，放入蒸笼蒸熟即成。",
    "beijing_baishuiyangtou": "1.羊头肉洗净放入锅中，加清水和花椒煮熟。2.捞出放凉后切成薄片，摆入盘中。3.蘸盐和花椒粉食用。",
    "beijing_baodu": "1.牛肚洗净切成条状备用。2.锅中烧开水，将牛肚快速焯烫数秒捞出，保持脆嫩。3.蘸芝麻酱、辣椒油，撒香菜拌匀即可食用。",
    "beijing_chaogan": "1.猪肝和猪肠处理干净，猪肝切片，猪肠切段。2.锅中加水烧开，放入猪肝和猪肠煮熟，加蒜末和淀粉勾芡。3.煮至汤汁浓稠，盛入碗中即可食用。",
    "beijing_chaoguan": "1.猪肝和猪肠处理干净，猪肝切片，猪肠切段。2.锅中加水烧开，放入猪肝和猪肠煮熟，加蒜末和淀粉勾芡。3.煮至汤汁浓稠，盛入碗中即可食用。",
    "beijing_dalian": "1.猪肉加葱姜剁成馅料调味备用，面粉和成面团醒发。2.面团擀成长方形薄片，铺上肉馅卷成长条，切成段。3.放入平底锅中煎至两面金黄酥脆即成。",
    "beijing_dalianhuoshao": "1.面粉加猪油和成面团，醒发后分成小份。2.擀成薄圆饼，撒上葱花和盐，卷起再擀平。3.放入平底锅中烙至两面金黄酥脆即成。",
    "beijing_dalumian": "1.面条煮熟捞出盛碗备用。2.锅中热油，放入肉片、木耳、黄花菜翻炒，加水煮成卤汁。3.打入蛋花，浇在面条上即可食用。",
    "beijing_douzhi_jiaoquan": "1.绿豆磨成浆发酵后煮成豆汁。2.面粉加盐和碱和成面团，做成圆圈状入油锅炸至酥脆成焦圈。3.豆汁盛碗，配焦圈一起食用。",
    "beijing_douzhier": "1.绿豆浸泡后磨成浆，发酵至微微发酸。2.倒入锅中大火煮开，不断搅拌防止糊底。3.煮至浓稠即可盛出饮用。",
    "beijing_jiangbeya": "1.鸭子处理干净，用酱油和香料腌制数小时入味。2.放入锅中加酱油、八角、桂皮、冰糖和适量水，大火烧开。3.转小火慢炖至鸭肉酥烂入味，大火收汁后取出切块装盘。",
    "beijing_jiaoquan": "1.面粉加盐、碱和适量水和成面团，醒发后擀成薄片。2.切成小条，两条叠在一起用筷子压出中间的孔。3.放入热油锅中炸至金黄酥脆，捞出沥油即成。",
    "beijing_jingjiangrousi": "1.猪里脊切丝，用淀粉和料酒抓匀腌制。2.锅中热油，放入肉丝滑炒至变色，加入甜面酱翻炒均匀。3.出锅装盘，用豆腐皮包裹肉丝和葱丝一起食用。",
    "beijing_luzhu": "1.猪肺和猪肠处理干净焯水，火烧切块，豆腐切块备用。2.锅中加水和调料烧开，放入猪肺、猪肠小火慢煮至酥烂。3.加入火烧和豆腐同煮片刻，盛出浇上蒜汁即可食用。",
    "beijing_luzhu_huoshao": "1.猪肺和猪肠处理干净焯水，火烧切块，豆腐切块备用。2.锅中加水和调料烧开，放入猪肺、猪肠小火慢煮至酥烂。3.加入火烧和豆腐同煮片刻，盛出浇上蒜汁即可食用。",
    "beijing_lvdagun": "1.糯米粉加水和成面团，上锅蒸熟后取出擀成大片。2.在面片上均匀铺上红豆沙，卷成卷状。3.表面撒上炒熟的黄豆面，切成段即可食用。",
    "beijing_mending": "1.牛肉加葱和花椒剁成馅料调味备用，面粉和成面团醒发。2.面团分成小剂子，包入馅料做成圆饼状，形似门钉。3.放入平底锅中煎至两面金黄即成。",
    "beijing_miancha": "1.小米面加水调成糊状，倒入锅中小火煮成浓稠的面茶。2.盛入碗中，中间留出凹槽。3.淋上芝麻酱，撒上芝麻和花椒盐，沿碗边转着喝。",
    "beijing_nai_lao_juan": "1.牛奶加白糖小火加热至微温，加入米酒搅拌均匀。2.倒入碗中放入蒸笼，小火蒸至凝固。3.取出放凉后放入冰箱冷藏，食用时口感细腻滑嫩。",
    "beijing_nailao": "1.牛奶加白糖小火加热至微温，关火后加入米酒汁搅拌均匀。2.倒入小碗中，放入烤箱低温烤至凝固。3.取出放凉后冷藏，食用时表面光滑、口感细腻。",
    "beijing_qiangmian": "1.荞麦面加水和成面团，用饸饹床压成面条入锅煮熟。2.羊肉切片加辣椒煮成汤底。3.面条捞入碗中，浇上羊肉汤，撒香菜即可食用。",
    "beijing_roast_duck": "1.填鸭处理干净，吹气使皮肉分离，刷上饴糖水晾干。2.挂入烤炉中用果木明火烤制，不断翻转至皮色枣红酥脆。3.片成薄片，配薄饼、甜面酱、葱丝卷食。",
    "beijing_shuan_yangrou": "1.铜锅加清汤烧开，保持沸腾状态。2.羊肉片薄切装盘，配好芝麻酱、韭菜花和腐乳蘸料。3.将羊肉片放入锅中涮至变色即捞出，蘸料食用。",
    "beijing_shuanyangrou": "1.铜锅加清汤烧开，保持沸腾状态。2.羊肉片薄切装盘，配好芝麻酱、韭菜花和腐乳蘸料。3.将羊肉片放入锅中涮至变色即捞出，蘸料食用。",
    "beijing_suanniurou": "1.五花肉冷水下锅煮熟，捞出放凉后切成薄片。2.蒜捣成蒜泥，加入酱油和辣椒油调成蘸汁。3.白肉片摆入盘中，浇上蒜泥蘸汁即可食用。",
    "beijing_tanghulu": "1.山楂洗净去核，用竹签串成串备用。2.冰糖加水小火熬成糖浆，至拉丝状态。3.将山楂串快速蘸裹糖浆，放凉后糖衣凝固即成。",
    "beijing_tangroubing": "1.面粉加红糖和芝麻和成面团，醒发后分成小份。2.擀成圆饼状，放入平底锅中小火烙制。3.烙至两面金黄、内部熟透即成。",
    "beijing_wandouhuang": "1.豌豆浸泡后煮烂，去皮捣成细腻的豆泥。2.加入白糖和桂花，倒入锅中小火翻炒至浓稠。3.倒入模具中压平，放凉凝固后切块即成。",
    "beijing_zhajiang_mian": "1.五花肉切丁，锅中热油放入黄酱和肉丁小火翻炒至酱香浓郁。2.手擀面煮熟捞出盛碗。3.浇上炸酱，配上黄瓜丝和焯熟的豆芽，拌匀食用。",
    "beijing_zhajiang_mian2": "1.五花肉切丁，锅中热油放入黄酱和肉丁小火翻炒至酱香浓郁。2.手擀面煮熟捞出盛碗。3.浇上炸酱，配上黄瓜丝和焯熟的豆芽，拌匀食用。",
    "beijing_zhajiangmian": "1.五花肉切丁，锅中热油放入黄酱和肉丁小火翻炒至酱香浓郁。2.手擀面煮熟捞出盛碗。3.浇上炸酱，配上黄瓜丝和焯熟的豆芽，拌匀食用。",

    # === Chongqing ===
    "chongqing_bingtangyuan": "1.糯米粉加温水揉成小汤圆，下入沸水中煮至浮起。2.捞出放入冰水中过凉，沥干盛入碗中。3.淋上红糖水，撒上花生碎，加冰块即成。",
    "chongqing_chuanshaorou": "1.各种食材穿成竹签串备用，牛油锅底加辣椒和花椒烧开。2.将串串放入沸腾的锅底中煮熟。3.捞出蘸干碟或油碟食用。",
    "chongqing_ciba": "1.糯米浸泡后蒸熟，趁热捣成糍粑团。2.分成小块，入油锅炸至表面金黄。3.捞出裹上红糖、黄豆面和芝麻即成。",
    "chongqing_ciqikou_mahua": "1.面粉加白糖、芝麻、花生碎和成面团，醒发后搓成长条。2.将长条对折拧成麻花状。3.放入热油中炸至金黄酥脆，捞出沥油即成。",
    "chongqing_douhua_fan": "1.黄豆磨成豆浆烧开，用胆水点成豆花。2.碗中放入米饭，舀上嫩豆花。3.淋上辣椒油和花椒面，拌匀即可食用。",
    "chongqing_fuling_youlozao": "1.锅中放入猪油烧热，加入醪糟小火翻炒。2.放入芝麻、花生碎和核桃碎同炒至香。3.炒至浓稠出油即成，可直接食用或冲水饮用。",
    "chongqing_ganguo_tudou_pian": "1.土豆去皮切薄片泡水去淀粉，五花肉切片，蒜苗切段。2.锅中热油，放入五花肉煸出油，加入辣椒、花椒和豆瓣酱炒香。3.倒入土豆片大火翻炒至熟，加蒜苗炒匀出锅。",
    "chongqing_guokui": "1.面粉和成面团醒发，猪肉馅加花椒和葱花调成馅料。2.面团分成小剂子，包入馅料擀成椭圆形饼状。3.放入烤炉中烤至两面金黄酥脆即成。",
    "chongqing_hongshao_feichang": "1.猪肥肠用盐和醋反复搓洗干净，焯水去腥切段。2.锅中热油，放入豆瓣酱、花椒、八角、桂皮炒香，加入肥肠翻炒。3.加适量水大火烧开转小火慢炖至软烂，收汁装盘。",
    "chongqing_huoguo": "1.锅中放入牛油烧热，加入辣椒、花椒和豆瓣炒出红油，加水煮成锅底。2.各种涮菜洗净切好装盘。3.锅底烧开后，将涮菜依次放入煮熟，蘸油碟食用。",
    "chongqing_jiangtuan_yu": "1.江团鱼处理干净切块，酸菜切段备用。2.锅中热油，放入辣椒、花椒和酸菜炒香。3.加入适量水烧开，放入鱼块煮至熟透入味即成。",
    "chongqing_jigong_bao": "1.公鸡切块焯水，土豆和魔芋切块备用。2.锅中热油，放入辣椒、花椒和豆瓣酱炒香，倒入鸡块翻炒上色。3.加入土豆和魔芋，加适量水炖至鸡肉软烂入味即成。",
    "chongqing_kao_naohua": "1.猪脑处理干净去筋膜，放入烤碗中。2.淋上辣椒油、花椒面、蒜泥，撒上折耳根碎。3.放入烤箱烤至表面微焦、内部嫩滑即成。",
    "chongqing_laifeng_yu": "1.草鱼处理干净切块，用盐和料酒腌制片刻。2.锅中热油，放入辣椒、花椒、豆瓣和姜蒜炒出红油。3.加入适量水烧开，放入鱼块煮至入味熟透，大火收汁即成。",
    "chongqing_laziji": "1.鸡肉切小块，用盐和料酒腌制入味。2.将鸡块入热油锅炸至金黄酥脆捞出。3.锅留底油，放入大量干辣椒和花椒炒香，倒入鸡块和芝麻翻炒均匀即成。",
    "chongqing_lianggao": "1.大米磨成浆，加水调成糊状倒入锅中小火煮成浓稠米糊。2.倒入碗中放凉凝固成型。3.扣出淋上红糖水，加冰块即可食用。",
    "chongqing_maoxuewang": "1.鸭血切块，毛肚切片，黄豆芽焯水垫底。2.锅中热油，放入辣椒和花椒炒出红油，加水烧开。3.放入鸭血和毛肚煮熟，倒在豆芽上，浇热油激香即成。",
    "chongqing_mifen": "1.米粉用温水泡软备用。2.锅中加水烧开，放入牛肉片和酸菜煮出汤底。3.下入米粉煮熟，盛入碗中，淋上辣椒油和花椒面即成。",
    "chongqing_nuomi_tuan": "1.糯米浸泡后蒸熟成糯米饭。2.取一团糯米饭按扁，包入油条和白糖。3.搓成圆团，裹上黄豆面即成。",
    "chongqing_paojiao_niuwa": "1.牛蛙处理干净切块，用盐和料酒腌制。2.锅中热油，放入泡椒、花椒、蒜和姜炒出香味。3.倒入牛蛙大火翻炒至熟透入味，出锅装盘。",
    "chongqing_pijiu_ya": "1.鸭子切块焯水去腥备用。2.锅中热油，放入辣椒、花椒和姜炒香，倒入鸭块翻炒上色。3.倒入啤酒没过鸭块，大火烧开转小火炖至酥烂，收汁即成。",
    "chongqing_quanshui_ji": "1.土鸡切块焯水备用。2.锅中热油，放入辣椒、花椒和泡椒炒香，倒入鸡块翻炒。3.加入山泉水大火烧开转小火炖至鸡肉软烂入味即成。",
    "chongqing_sanjiao_ba": "1.大米磨成浆，加白糖搅拌均匀成糊状。2.倒入三角形模具中，撒上芝麻。3.放入烤炉中烤至两面金黄、外酥内软即成。",
    "chongqing_shaguo_mifen": "1.米线用温水泡软，猪肉切片备用。2.砂锅中加水烧开，放入猪肉、辣椒、花椒和蔬菜煮出汤底。3.下入米线煮至熟透入味，加盐调味即成。",
    "chongqing_shancheng_tangyuan": "1.黑芝麻炒香擀碎，加白糖和猪油拌成馅料冷冻成型。2.糯米粉加水揉成面团，分成小份包入芝麻馅搓圆。3.下入沸水中煮至浮起即成。",
    "chongqing_suanla_fen": "1.红薯粉用温水泡软备用。2.碗中放入醋、辣椒、花生碎和榨菜调成底料。3.红薯粉下入沸水中煮熟，捞入碗中拌匀即成。",
    "chongqing_suanla_jizhua": "1.鸡爪洗净剪去指甲，放入沸水中煮熟捞出过凉水。2.泡椒、醋、花椒和蒜调成酸辣汁。3.鸡爪放入酸辣汁中浸泡数小时入味即成。",
    "chongqing_suantang_feiniu": "1.酸菜和番茄切碎，肥牛片备用。2.锅中热油，放入酸菜、泡椒和番茄炒出酸香味，加水煮成汤底。3.汤底烧开后放入肥牛片涮至变色即成。",
    "chongqing_wanzhou_kaoyu": "1.草鱼处理干净从背部剖开，用盐和料酒腌制，放炭火上烤至两面微焦。2.锅中热油，放入辣椒、花椒、洋葱和花生炒香制成浇头。3.将浇头淋在烤好的鱼上，再入烤箱烤入味即成。",
    "chongqing_xiaomian": "1.碗中放入辣椒油、花椒面、芽菜和花生碎调成底料。2.碱水面下入沸水中煮熟，捞入碗中。3.加入面汤，撒上葱花，拌匀即成。",
    "chongqing_zhaji_mian": "1.猪肉末加甜面酱炒成杂酱备用。2.面条下入沸水中煮熟捞出盛碗。3.浇上杂酱和辣椒油，拌匀即可食用。",

    # === Fujian ===
    "fujian_bianrou": "1.猪肉剁成肉泥，用木棒反复捶打至起胶有弹性。2.取燕皮包入肉馅，捏成馄饨状。3.下入沸水中煮至浮起，盛入碗中撒葱花即成。",
    "fujian_fotiaoqiang": "1.鲍鱼、海参、鱼翅、花胶等食材分别发制处理好。2.将所有食材码入坛中，加高汤和花雕酒密封。3.文火慢炖数小时至食材软烂、汤汁浓稠鲜美即成。",
    "fujian_fuding_roupian": "1.猪瘦肉剁成肉泥，加淀粉反复揉搓至有弹性。2.将肉泥捏成薄片，下入沸水中煮至浮起。3.盛入碗中，加醋和辣椒调味即成。",
    "fujian_fuqing_haili_bing": "1.海蛎洗净沥干，加葱花和黄豆拌匀成馅料。2.米浆舀入专用铁勺中，放入馅料，再盖上一层米浆。3.放入热油中炸至金黄酥脆，脱出即成。",
    "fujian_fuzhou_yuwan": "1.鳗鱼肉剁成鱼泥，加淀粉搅拌上劲至有弹性。2.取适量鱼泥包入猪肉馅，搓成丸子状。3.下入清汤中煮至浮起熟透，加葱花调味即成。",
    "fujian_guangbing": "1.面粉加水和盐和成面团，醒发后分成小份。2.擀成小圆饼，表面撒上芝麻按实。3.贴入烤炉中烤至鼓起金黄即成。",
    "fujian_lizhi_rou": "1.猪瘦肉切块，表面划十字花刀，加淀粉裹匀。2.入油锅炸至表面开花形似荔枝，捞出。3.锅中用番茄酱、糖和醋调成酸甜汁，倒入肉块翻炒均匀即成。",
    "fujian_longyan_kejia_niang_doufu": "1.豆腐切块，中间挖出凹槽，填入猪肉、香菇和虾米拌成的馅料。2.放入锅中煎至两面金黄。3.加入酱油和适量水，小火慢炖至入味即成。",
    "fujian_longyan_qingtang_fen": "1.猪骨熬成清汤备用，米粉用沸水烫熟。2.米粉捞入碗中，舀入滚烫的骨汤。3.撒上葱花和辣椒，加盐调味即成。",
    "fujian_longyan_yongding_tufan": "1.海沙虫洗净，放入锅中加水熬煮出胶质。2.过滤后汤汁放凉凝固成冻状。3.切块装盘，蘸醋、蒜泥和辣椒酱食用。",
    "fujian_minhou_guanguo": "1.面粉和成面团做成光饼烤熟备用。2.五花肉和酸菜炒成馅料。3.将光饼从中间剖开，夹入炒好的馅料即成。",
    "fujian_minnan_xian_fan": "1.大米洗净，五花肉切丁，香菇和虾米泡发切碎。2.所有食材加酱油拌匀，放入电饭锅中。3.加适量水煮成咸香软糯的咸饭即成。",
    "fujian_ningde_jiguang_bing": "1.面粉加水和盐和成面团，醒发后分成小份。2.擀成小圆饼，表面撒上芝麻按实。3.贴入烤炉中烤至鼓起金黄即成。",
    "fujian_ningde_yuwan": "1.鳗鱼肉剁成鱼泥，加淀粉搅拌上劲。2.取适量鱼泥包入猪肉馅，搓成丸子。3.下入清汤中煮至浮起，撒葱花即成。",
    "fujian_putian_hongtuan": "1.糯米粉加红曲米粉和水揉成红色面团。2.分成小份包入红豆沙馅，放入模具压出花纹。3.放入蒸笼大火蒸熟即成。",
    "fujian_putian_mian": "1.猪肉切片，香菇和虾仁泡发，蛏干洗净备用。2.锅中热油炒香配料，加水烧成汤底。3.下面条煮至熟透入味，汤汁浓稠即成。",
    "fujian_quanzhou_cu_rou": "1.猪瘦肉切条，用醋、五香粉和淀粉腌制入味。2.入油锅炸至金黄酥脆捞出。3.装盘后可再淋少许醋增香即成。",
    "fujian_quanzhou_jiangmu_ya": "1.番鸭切块，老姜切片备用。2.锅中倒入麻油烧热，放入姜片煸至焦香，加入鸭块翻炒。3.倒入米酒和中药材，小火慢炖至鸭肉酥烂入味即成。",
    "fujian_quanzhou_mianxian": "1.面线掰成小段备用，猪血和大肠处理干净切块。2.锅中加水烧开，放入猪血、大肠和虾仁煮熟。3.下入面线煮至糊状，加醋调味即成。",
    "fujian_quanzhou_rou_zong": "1.糯米浸泡沥干，五花肉用酱油腌制，香菇虾仁栗子和干贝备好。2.粽叶折成斗状，铺一层糯米，放入馅料，再盖糯米包好扎紧。3.放入锅中大火蒸两小时至糯米软糯即成。",
    "fujian_shatang_mian": "1.猪肝切片，鱿鱼切花，豆腐切块备用。2.锅中加水烧开，放入沙茶酱化开成汤底。3.下入碱水面和各种配料煮熟，调味即成。",
    "fujian_shaxian_bianrou": "1.猪肉剁成肉泥，用木棒反复捶打至起胶。2.取馄饨皮包入肉馅，捏成扁肉状。3.下入沸水中煮至浮起，撒上葱花和紫菜即成。",
    "fujian_tongan_fengrou": "1.五花肉切大块，板栗去壳，虾仁和香菇泡发备用。2.所有食材放入大碗中，加酱油和调料拌匀。3.用纱布封口，放入蒸锅大火蒸三小时至酥烂即成。",
    "fujian_wuyi_yancha": "1.取武夷岩茶适量放入盖碗中。2.用沸水快速冲泡，第一泡洗茶倒掉。3.再次注水冲泡数秒后出汤，即可品饮岩骨花香。",
    "fujian_xiamen_chunjuan": "1.豆芽、胡萝卜和豆腐干切丝，猪肉切丝炒熟备用。2.薄饼皮摊开，铺上海苔，放上各种馅料。3.卷成春卷状，可直接食用或入油锅微炸至皮脆。",
    "fujian_xiamen_hailijian": "1.海蛎洗净沥干，加地瓜粉和蛋液拌匀成糊状。2.平底锅中倒油烧热，倒入海蛎糊摊成圆饼。3.煎至两面金黄，淋上甜辣酱即成。",
    "fujian_xiamen_huasheng_tang": "1.花生提前浸泡数小时，去皮备用。2.放入锅中加水和白糖，小火慢煮至花生酥烂。3.打入鸡蛋搅散成蛋花，煮开即成。",
    "fujian_zhangzhou_shashao": "1.猪肝切片，鱿鱼切花，豆腐切块备用。2.锅中加水烧开，放入沙茶酱化开成汤底。3.下入面条和各种配料煮熟即成。",
    "fujian_zhangzhou_shouzhua_mian": "1.碱水面煮熟捞出放凉。2.甜辣酱、花生酱和蒜蓉调成蘸酱。3.手抓面条蘸酱食用。",
    "fujian_zhangzhou_siguo_tang": "1.绿豆、红豆、薏米和莲子分别煮熟备用。2.银耳泡发撕成小朵煮至软糯。3.将所有食材混合，加蜂蜜调味，放凉或冰镇后食用。",

    # === Gansu ===
    "gansu_baiyin_huanghe_gu": "1.整羊处理干净，用孜然、辣椒面和盐里外涂抹腌制数小时。2.穿在铁架上，放入烤坑中用炭火慢烤。3.不断翻转刷油，烤至表皮金黄酥脆、肉质鲜嫩即成。",
    "gansu_baiyin_huanghe_li": "1.黄河鲤鱼处理干净，表面划花刀，用盐和料酒腌制。2.裹上淀粉入油锅炸至金黄酥脆捞出。3.锅中用糖、醋和番茄酱调成糖醋汁，浇在鱼上即成。",
    "gansu_dingxi_kuanfen": "1.土豆粉宽粉用温水泡软备用。2.碗中放入辣椒油、醋、蒜末和香菜调成底料。3.宽粉下入沸水中煮熟捞入碗中，拌匀即成。",
    "gansu_dingxi_yangyu_jianbing": "1.土豆去皮擦成丝或蒸熟捣成泥。2.加面粉和水搅拌成糊状，倒入平底锅中摊成薄饼。3.煎至两面金黄，配辣椒油、醋和蒜汁食用。",
    "gansu_dongxiang_shouzhua": "1.东乡羊切大块，冷水下锅加花椒煮开去沫。2.转中火煮至羊肉刚熟，捞出装盘。3.蘸盐和蒜食用，保持羊肉原味。",
    "gansu_dunhuang_lumo": "1.驴肉切块加调料卤煮至酥烂入味备用。2.面粉和成面团，擀成面条煮熟捞出。3.浇上驴肉卤汁，加辣椒油和蒜调味即成。",
    "gansu_gannan_niunai_zhazi": "1.牦牛奶加热后提取酥油，剩余奶液发酵凝固。2.将凝固的奶渣挤干水分。3.加白糖拌匀，冷藏后食用。",
    "gansu_gannan_zangba": "1.青稞面放入碗中，加入酥油和碎奶酪。2.用手反复揉捏混合均匀成团。3.捏成小块即可食用。",
    "gansu_jiangshui_mian": "1.浆水提前发酵好备用，面条煮熟捞出。2.锅中热油，放入辣椒和韭菜炒香，加入浆水烧开。3.将浆水汤浇在面上即成。",
    "gansu_jinchang_yangrou_fen": "1.羊肉切块焯水去腥，粉条泡软备用。2.锅中加水烧开，放入羊肉和花椒炖煮至熟。3.加入粉条煮透，盛入碗中撒辣椒和香菜即成。",
    "gansu_jiuquan_paozhang": "1.面条煮熟捞出沥干备用。2.碗中放入辣椒油、醋、蒜泥和黄瓜丝调成底料。3.将面条放入碗中拌匀，浸泡入味后食用。",
    "gansu_jiuquan_suo_fen": "1.锁阳磨成粉，与面粉、白糖和芝麻混合。2.加水和成面团，分成小份擀成圆饼状。3.放入热油中炸至金黄酥脆，捞出沥油即成。",
    "gansu_lanzhou_huizhou_mian": "1.面条煮熟捞出过凉水沥干。2.碗中放入芝麻酱、辣椒油、醋和蒜泥调成料汁。3.将凉面放入碗中拌匀即成。",
    "gansu_lanzhou_niurou_mian": "1.牛肉加香料煮熟切片，萝卜切片煮透备用。2.手工拉面下入沸水中煮熟捞出盛碗。3.浇上牛肉汤，放上牛肉和萝卜，加辣椒油、蒜苗和香菜。",
    "gansu_lanzhou_tianpei": "1.豌豆和红枣提前浸泡数小时。2.放入锅中加水大火烧开转小火慢煮至豌豆开花酥烂。3.加入白糖调味，煮至浓稠即成。",
    "gansu_linxia_shouzhua": "1.羊肉切大块冷水下锅，加花椒煮开撇去浮沫。2.中火煮至羊肉刚熟，保持鲜嫩口感。3.捞出装盘，蘸盐和蒜食用。",
    "gansu_longnan_yangyu_jianbing": "1.土豆去皮蒸熟捣成泥状。2.加面粉和水搅拌均匀，倒入锅中小火翻搅成团。3.盛出蘸辣椒油、醋和咸菜食用。",
    "gansu_longxi_larou": "1.猪肉切成长条，用盐、花椒和白酒涂抹均匀腌制数天。2.取出挂在通风处晾干表面水分。3.用柏枝和锯末熏制至表面金黄、香味浓郁即成。",
}


def generate_recipe(dish):
    """Generate a concise 2-3 step recipe in Chinese for a dish."""
    dish_id = dish["id"]

    # Check for specific recipe override first
    if dish_id in SPECIFIC_RECIPES:
        return SPECIFIC_RECIPES[dish_id]

    # Fallback to generic generation
    name = dish["name"]
    category = dish["category"]
    methods = dish["cooking_methods"]
    ingredients = dish["main_ingredients"]
    difficulty = dish["difficulty"]

    ing_str = "、".join(ingredients[:4])

    def has(kw):
        return any(kw in ing for ing in ingredients)

    # ── Fallback templates ──
    if methods == ["boil"] and category == "drink":
        return f"1.将{ing_str}准备好。2.放入壶中，用沸水冲泡或小火慢煮。3.待出味后倒入杯中即可饮用。"

    if methods == ["boil"] and category == "soup":
        return f"1.将{ing_str}洗净准备好。2.放入锅中加足量清水大火烧开，撇去浮沫。3.转小火慢煮至食材出味，加盐调味即成。"

    if "stir_fry" in methods and category == "main":
        return f"1.将{ing_str}洗净切好备用。2.锅中热油，爆香葱姜蒜，放入主料大火翻炒。3.加入调料调味，炒匀入味后出锅装盘。"

    if "braise" in methods and category == "main":
        return f"1.将{ing_str}准备好，主料切块焯水去腥。2.锅中热油，放入主料和调料翻炒上色。3.加适量水，大火烧开转小火慢炖至入味，收汁装盘。"

    if "steam" in methods and category in ("snack", "dessert"):
        return f"1.将{ing_str}准备好，混合揉成面团或糊状。2.分成小份，包入馅料或做成造型。3.放入蒸笼大火蒸熟，取出即成。"

    if "deep_fry" in methods and category in ("snack", "street_food"):
        return f"1.将{ing_str}准备好，加工处理成适当形状。2.裹上面糊或调味料。3.放入热油中炸至金黄酥脆，捞出沥油即成。"

    if "roast" in methods and category in ("snack", "staple", "street_food"):
        return f"1.将{ing_str}准备好，加工处理成适当形状。2.刷上酱料或撒上调味料。3.放入烤炉中烤至金黄熟透，取出即成。"

    if "boil" in methods and category == "staple":
        return f"1.将{ing_str}准备好备用。2.锅中烧开水，放入主料煮熟。3.加入调料和配料调味，煮至入味即可食用。"

    if "cold" in methods and category == "cold_dish":
        return f"1.将{ing_str}准备好，主料煮熟或焯水后放凉。2.切成适当形状摆入盘中。3.调入酱油、醋、蒜泥和辣椒油等调料拌匀即成。"

    # Generic fallback
    return f"1.将{ing_str}准备好备用。2.按传统方法加工处理主料，调味烹制。3.至食材熟透入味即可装盘食用。"


def escape_sql_string(s):
    """Escape single quotes for SQL by doubling them."""
    return s.replace("'", "''")


def count_chinese_chars(s):
    """Count Chinese characters in a string."""
    return sum(1 for c in s if '一' <= c <= '鿿' or '㐀' <= c <= '䶿')


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(script_dir, "batch_1.json")
    output_file = os.path.join(script_dir, "recipes_1.sql")

    with open(input_file, "r", encoding="utf-8") as f:
        dishes = json.load(f)

    print(f"Loaded {len(dishes)} dishes from batch_1.json")

    sql_lines = []
    sql_lines.append("-- Auto-generated recipes for batch_1 dishes")
    sql_lines.append(f"-- Total: {len(dishes)} dishes")
    sql_lines.append("")

    short_count = 0
    long_count = 0

    for dish in dishes:
        dish_id = dish["id"]
        recipe = generate_recipe(dish)

        # Validate length
        cn_chars = count_chinese_chars(recipe)
        if cn_chars < 60:
            print(f"WARNING: Recipe for '{dish['name']}' has only {cn_chars} Chinese chars")
            short_count += 1
        if cn_chars > 180:
            print(f"WARNING: Recipe for '{dish['name']}' has {cn_chars} Chinese chars (may be too long)")
            long_count += 1

        # Escape for SQL
        escaped_recipe = escape_sql_string(recipe)
        sql = f"UPDATE dishes SET recipe = '{escaped_recipe}' WHERE id = '{dish_id}';"
        sql_lines.append(sql)

    sql_lines.append("")
    sql_lines.append(f"-- End of recipes ({len(dishes)} total)")

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    print(f"\nGenerated {len(dishes)} recipes -> {output_file}")
    print(f"Short recipes (<60 chars): {short_count}")
    print(f"Long recipes (>180 chars): {long_count}")

    # Verify output
    with open(output_file, "r", encoding="utf-8") as f:
        content = f.read()
    update_count = content.count("UPDATE dishes SET recipe = ")
    print(f"Total UPDATE statements in output: {update_count}")

    # Sample output
    print("\n--- Sample recipes ---")
    for dish in dishes[:5]:
        recipe = generate_recipe(dish)
        cn_chars = count_chinese_chars(recipe)
        print(f"\n{dish['name']} ({dish['id']}) [{cn_chars} chars]:")
        print(f"  {recipe}")


if __name__ == "__main__":
    main()

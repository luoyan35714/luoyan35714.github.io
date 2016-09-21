---
layout: post
title:  Modbus-学习笔记(二)-模拟环境搭建
date:   2016-06-02 17:46:01 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}


下载安装modbus_poll
================================
[/resources/modbus/ModBusPol.zip](/resources/modbus/ModBusPol.zip)

下载安装modbus_slave
================================
[/resources/modbus/modbusslave.rar](/resources/modbus/modbusslave.rar)

下载安装vspd虚拟串口模拟器
================================
[/resources/modbus/vspd7.2.308.zip](/resources/modbus/vspd7.2.308.zip)

模拟基于TCP的MODBUS协议
================================

+ a) Modbus TCP 模拟Server的搭建
+ b) 打开modbus_slave，new一个新的文档。然后选中Toolbar中的Connection，选择connect,在端口处写502

![/images/blog/modbus/modbus-02-simulation-environment-setup/01.png](/images/blog/modbus/modbus-02-simulation-environment-setup/01.png)

+ c) 在创建的file文件中点击00000列的空白处

![/images/blog/modbus/modbus-02-simulation-environment-setup/02.png](/images/blog/modbus/modbus-02-simulation-environment-setup/02.png)

+ d) 在弹出的对话框中输入一个数字，并选中Auto increment（每秒钟+1）
+ e)
+ f) Modbus TCP Client的使用
+ g) 打开modbus_poll,依次选中toolbar中的Connection,点击Connect
+ h) 在弹出的对话框输入如下

![/images/blog/modbus/modbus-02-simulation-environment-setup/03.png](/images/blog/modbus/modbus-02-simulation-environment-setup/03.png)

+ i) 确定之后就可以在界面看到通过TCP协议监控到的Modbus协议指标信息

![/images/blog/modbus/modbus-02-simulation-environment-setup/04.png](/images/blog/modbus/modbus-02-simulation-environment-setup/04.png)

+ j) 然后选中Toolbar中的Display，点击communication，会出现具体的协议传输细节

![/images/blog/modbus/modbus-02-simulation-environment-setup/05.png](/images/blog/modbus/modbus-02-simulation-environment-setup/05.png)

+ k) 这样Modbus的TCP 模拟Server和Client就都搭建完了

模拟基于RTU的MODBUS协议
================================

+ a) 创建虚拟端口
+ b) 打开vspd，在右侧ManagePorts中选中First Port为COM10，Second Port为COM11，点击Add pair

![/images/blog/modbus/modbus-02-simulation-environment-setup/06.png](/images/blog/modbus/modbus-02-simulation-environment-setup/06.png)

+ c)
+ d) 模拟Server搭建
+ e) 打开modbus_slave，依次选中Toolbar中的Connection，点击Connect，在Port中选择Port 10，按照如下配置

![/images/blog/modbus/modbus-02-simulation-environment-setup/07.png](/images/blog/modbus/modbus-02-simulation-environment-setup/07.png)

+ f) 确认后在文档空白处设置模拟值

![/images/blog/modbus/modbus-02-simulation-environment-setup/08.png](/images/blog/modbus/modbus-02-simulation-environment-setup/08.png)

+ g)
+ h) 搭建Client环境
+ i) 打开Modbus_poll，依次选中Toolbar中的Connection，点击Connect
+ j) 在弹出的对话框中选择Port为Port 11，其他按照如下配置

![/images/blog/modbus/modbus-02-simulation-environment-setup/09.png](/images/blog/modbus/modbus-02-simulation-environment-setup/09.png)

+ k) 点击OK之后就可以看到通过MODBUS RTU协议采集到的数据

![/images/blog/modbus/modbus-02-simulation-environment-setup/10.png](/images/blog/modbus/modbus-02-simulation-environment-setup/10.png)

+ l) 协议具体的传输信息可以通过选中Toolbar的Display, 点击Communication在弹出的对话框中查看。

![/images/blog/modbus/modbus-02-simulation-environment-setup/11.png](/images/blog/modbus/modbus-02-simulation-environment-setup/11.png)

`至此，基于TCP和RTU的modbus协议模拟Server和Client就都搭建完了。`


<br>
<br>

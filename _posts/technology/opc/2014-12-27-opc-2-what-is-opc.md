---
layout: post
title:  OPC-学习笔记(二)-什么是OPC
date:   2014-12-27 15:53:01 +0800
category : 技术文档
tag : OPC
---
 
 * content
{:toc}


OPC
================================

OPC(OLE for Process Control, 用于过程控制的OLE)是一个工业标准，管理这个标准国际组织是OPC基金会.

为什么需要OPC
================================

OPC是为了不同供应厂商的设备和应用程序之间的软件接口标准化，使其间的数据交换更加简单化的目的而提出的。作为结果，从而可以向用户提供不依靠于特定开发语言和开发环境的可以自由组合使用的过程控制软件组件产品。

利用驱动器的系统连接：

![Driver connection](/images/blog/opc/2_what_is_opc/1_driver_connection.png)

利用OPC的控制系统构成:

![OPC connection](/images/blog/opc/2_what_is_opc/2_opc_connection.png)

Opc的分层结构
================================

![OPC Structure](/images/blog/opc/2_what_is_opc/3_structure.png)

OPC对象中的最上层的对象是OPC服务器。一个OPC服务器里可以设置一个以上的OPC组。OPC服务器经常对应于某种特定的控制设备。例如，某种DCS控制系统，或者某种PLC控制装置。

OPC组是可以进行某种目的数据访问的多个的OPC标签的集合，例如某监视画面里所有需要更新的位号变量。正因为有了OPC组，OPC应用程序就可以以同时需要的数据为一批的进行数据访问，也可以以OPC组为单位启动或停止数据访问。此外OPC组还提供组内任何OPC标签的数值变化时向OPC应用程序通知的数据变化事件

<br>
<br>

参考资料
================================

日本OPC协会：《OPC应用程序入门》

司纪刚：《OPCDA 服务器与客户程序开发指南》
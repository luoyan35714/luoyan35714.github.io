---
layout: post
title:  OPC-学习笔记(三)-OPC主要功能
date:   2014-12-27 15:59:01 +0800
category : 技术文档
tag : OPC
---

* content
{:toc}

同步访问
================================

OPC服务器把按照OPC应用程序的要求得到的数据访问结果作为方法的参数返回给OPC应用程序，OPC应用程序在结果被返回为止一直必须处于等待状态。

![Synch Read](/images/blog/opc/3_main_feature/1_sync_read.png)


异步访问
================================

OPC服务器接到OPC应用程序的要求后，几乎立即将方法返回。OPC应用程序随后可以进行其他处理。当OPC服务器完成数据访问时，触发OPC应用程序的异步访问完成事件，将数据访问结果传送给OPC应用程序。OPC应用程序在VB的事件处理程序中接受从OPC服务器传送来的数据。

![Asynch Read](/images/blog/opc/3_main_feature/2_aync_read.png)

订阅方式数据采集
================================

并不需要OPC应用程序向OPC服务器要求，就可以自动接到从OPC服务器送来的变化通知的订阅方式数据采集（Subscription）。服务器按一定的更新周期（UpdateRate）更新OPC服务器的数据缓冲器的数值时，如果发现数值有变化时，就会以数据变化事件（DataChange）通知OPC应用程序。如果OPC服务器支持不敏感带（DeadBand），而且OPC标签的数据类型是模拟量的情况，只有现在值与前次值的差的绝对值超过一定限度时，才更新缓冲器数据并通知OPC应用程序。由此可以无视模拟值的微小变化，从而减轻OPC服务器和OPC应用程序的负荷。

![Publish and subscribe](/images/blog/opc/3_main_feature/3_publish_subcribe.png)

上述的OPC功能可以总结为如下表：

![Feature sumary](/images/blog/opc/3_main_feature/4_feature_sumary.png)

三种方式的性能总结：

![Performance sumary](/images/blog/opc/3_main_feature/5_performance_sumary.png)

<br>
<br>

参考资料
================================

日本OPC协会：《OPC应用程序入门》

司纪刚：《OPCDA 服务器与客户程序开发指南》
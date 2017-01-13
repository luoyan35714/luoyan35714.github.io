---
layout:			post
title:			Zookeeper学习笔记之(十七) - zookeeper java API - curator - 09 - 常用工具
date:			2017-01-13 14:26:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


Curator高级API - Master选举
=======================================

在分布式系统中，经常会碰到这样的场景：对于一个复杂的任务，仅需要从集群中选举出一台进行处理即可。称为'Master选举'问题。借助Zookeeper，可以比较简单的实现Master选举的功能，大体思路如下：

> 选择一个根节点，例如/master_select,多台机器同事向该节点创建一个子节点/master_select/lock,利用Zookeeper的特性，最终只有一台机器能够创建成功，成功的哪台机器就作为Master。

Curator也是基于这个思路，但是它将节点创建，事件监听和自动选举过程进行了封装，开发人员只需要条用简单的API就可以实现Master选举


Curator高级API - 分布式锁
=======================================


Curator高级API - 分布式计数器
=======================================

Curator高级API - 分布式Barrier
=======================================


Curator工具类
=======================================

ZKPaths
-----------------

EnsurePath
-----------------


参考资料
=======================================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)

---
layout:			post
title:			Zookeeper学习笔记之(六) - zookeeper常用配置
date:			2017-01-09 14:17:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


基本配置
=================

| clientPort	| 监听client连接的端口号.														|
| dataDir		| 数据目录. 可以是任意目录.														|
| tickTime		| zookeeper中使用的基本时间,单位毫秒.											|


高级配置
=================

| dataLogDir				|		|
| initLimit					|		|
| syncLimit					|		|
| snapCount					|		|
| preAllocSize				|		|
| minSessionTimeout			|		|
| maxSessionTimeout			|		|
| maxClientCnxns			|		|
| jute.maxbuffer			|		|
| clientPortAddress			|		|
| server.id=host:port:port	|		|
| autopurge.snapRetainCount	|		|
| autopurge.purgeInteval	|		|
| fsync.warningthresholdms	|		|
| forceSync					|		|
| globalOutstandingLimit	|		|
| leaderServes				|		|
| SkipAcl					|		|
| xncTimeout				|		|
| electionAlg				|		|


集群
=================

> Zookeeper集群部署并非一定需要奇数台服务器，任意台Zookeeper服务器都能部署且能够正常运行。

一个Zookeeper集群如果要对外提供可用的服务，那么集群中必须要有过半的机器正常工作并且彼此之间能够正常通信。基于这个特性，如果想搭建一个能够允许N台机器挂掉的集群，那么就需要部署一个由2XN+1台服务器构成的Zookeeper集群。因此，一个由5台机器构成的Zookeeper集群，能够在挂掉2台机器后依然正常工作，而如果是一个由6台服务器构成的Zookeeper集群，同样只能够挂掉2台机器，因为如果挂掉3台，剩下的机器就无法实现过半了。

因此，从上面的讲解中，我们可以看出，对于一个由6台服务器组成的Zookeeper集群来说，和一个由5台服务器构成的Zookeeper集群相比，其在容灾能力上没有任何明显的提升。基于这个原因，Zookeeper集群通常设计部署成奇数台服务器即可。


容灾
=================

容灾主要是两个个方面，一个是单点问题，Zookeeper的单点问题可以通过搭建集群来解决。二是Zookeeper需要保证集群内服务器过半存活问题，可以考虑三机房部署(N1=N总/3,N2=N总/3, N3=N总-N1-N2,其中N代表机器数量)。对于双机房部署，可以将过半的Zookeeper部署在主机房。


参考资料
=================

百度百科：[zookeeper](http://baike.baidu.com/link?url=OB8b21xw3UldXVI0ghTO_cpEEw0BbjDlVtUJb4BoVpuCh7t6VmDP2MCxxt36KI4TK2ZzJ3a0oxkIrK5ozovm6h6F6UqDvu5CN7wanmGc-5W)

Zookeeper官网：[http://zookeeper.apache.org/](http://zookeeper.apache.org/)

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

---
layout:			post
title:			Zookeeper学习笔记之(一) - Zookeeper基本介绍 *
date:			2017-01-04 14:02:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


> 声明：本文大部分内容均摘录自参考资料。

简介
=======================================

ZooKeeper是一个分布式的，开放源码的分布式应用程序协调服务，是Google的Chubby一个开源的实现，它是集群的管理者，监视着集群中各个节点的状态根据节点提交的反馈进行下一步合理操作。最终，将简单易用的接口和性能高效、功能稳定的系统提供给用户。

在分布式应用中，由于工程师不能很好地使用锁机制，以及基于消息的协调机制不适合在某些应用中使用，因此需要有一种可靠的、可扩展的、分布式的、可配置的协调机制来统一系统的状态。Zookeeper的目的就在于此。

基本概念
=======================================

设计目的
=======================================

![/images/blog/zookeeper/01-introduction/01-zkservice.jpg](/images/blog/zookeeper/01-introduction/01-zkservice.jpg)

| Sequential Consistency	| Updates from a client will be applied in the order that they were sent. |
| Atomicity					| Updates either succeed or fail. No partial results. |
| Single System Image		| A client will see the same view of the service regardless of the server that it connects to. |
| Reliability				| Once an update has been applied, it will persist from that time forward until a client overwrites the update. |
| Timeliness				| The clients view of the system is guaranteed to be up-to-date within a certain time bound. |


基本概念
=======================================

集群角色
----------------------------------

通常在分布式系统中，构成一个集群的每一台机器都有自己的角色，最典型的集群模式就是Master/Slave模式(主备模式)。在这种模式中，我们把能够处理所有写操作的机器成为Master机器，把所有通过异步复制方式获取最新数据，并提供读服务的机器成为Slave机器。

而在Zookeeper中，这些概念被颠覆了。它没有沿用传统的Master/Slave概念，而是引入了Leader,Follower和Observer三种角色。Zookeeper集群中的所有机器通过一个Leader选举过程来选定一台被称为Leader的机器，Leader服务器为客户端提供读和写服务。除Leader外，其它机器包括Follower和Observer。Follower和Observer都能提供读服务，唯一的区别在于，Observer机器不参与Leader选举过程，也不参与写操作的“过半写成功”策略，因此Observer可以在不影响写性能的情况下提升集群的读性能。

会话
----------------------------------

Session是指客户端会话。在讲会话之前，首先了解下客户端连接。在Zookeeper中，一个客户端连接是指客户端和服务器之间的一个TCP长连接。Zookeeper对外的服务器端口默认是2181，客户端启动的时候，首先会与服务器建立一个TCP连接，从第一次连接建立开始，客户端会话的生命周期也开始了，通过这个连接，客户端能够通过心跳检测与服务器保持有效的会话，也能够向Zookeeper服务器发送请求并接收响应，同时还能够通过该连接接收来自服务器的Watch事件通知。Session的sessionTimeout值用来设置一个客户端会话的超时时间。当由于服务器压力太大，网络故障或是客户端主动断开链接等各种原因导致客户端连接断开时，只要在sessionTimeout规定的时间内能够重新连接上集群中任意一台服务器，那么之前创建的会话仍然有效。

数据节点
----------------------------------

在谈到分布式的时候，通常所说的“节点”是指组成集群的每一台机器。然而，在Zookeeper中，“节点”分为两类，第一类同样是指构成集群的机器，我们称之为机器节点；第二类则是指数据模型中的数据单元，我们称之为数据节点-ZNode。Zookeeper将所有数据存储在内存中，数据模型是一棵树(ZNode Tree),由斜杠(/)进行分割的路径，就是一个ZNode，例如/foo/path1。每个ZNode上都会保存自己的数据内容，同时还会保存一系列属性信息。

在Zookeeper中，ZNode可以分为持久节点和临时节点两类。所谓持久节点是指一旦这个ZNode被创建了，除非主动进行ZNode的移除操作，否则这个ZNode将一直保存在Zookeeper上。而临时节点就不一样了，它的生命周期和客户端会话绑定，一旦客户端会话失效，那么这个客户端创建的所有临时节点都会被移除。另外，Zookeeper还允许用户为每个节点添加一个特殊的属性：SEQUENTIAL。一旦节点被标记上这个属性，那么在这个节点被创建的时候，Zookeeper会自动在其节点名后面追加上一个整型数字，这个整型数字是一个由父节点维护的自增数字。

版本
----------------------------------

Zookeeper的每个ZNode上都会存储数据，对应于每个ZNode，Zookeeper都会为其维护一个叫做Stat的数据结构，Stat中记录了这个ZNode的三个数据版本，分别是version(当前ZNode的版本)，cversion(当前ZNode子节点的版本)和aversion(当前ZNode的ACL版本)。

Watcher
----------------------------------

Watcher(事件监听器)，是Zookeeper中的一个很重要的特性。Zookeeper允许用户在制定节点上注册一些Watcher，并且在一些特定事件触发的时候，Zookeeper服务端会将事件通知到感兴趣的客户端上去，该机制是Zookeeper实现分布式协调服务的重要特性。

ACL
----------------------------------

Zookeeper采用ACL(Access Control Lists)策略来进行权限控制，类似于Unix文件系统的权限控制。

+ CREATE：创建子节点的权限
+ READ：获取节点数据和子节点列表的权限
+ WRITE：更新节点数据的权限
+ DELETE：删除子节点的权限
+ ADMIN：设置节点ACL权限

> 尤其需要注意的是，CREATE和DELETE这两种权限都是针对子节点的权限控制。


数据模型
=======================================

![/images/blog/zookeeper/01-introduction/02-zknamespace.jpg](/images/blog/zookeeper/01-introduction/02-zknamespace.jpg)

Zookeeper提供的命名空间类似于文件系统。每个目录项如 NameService 都被称作为znode，和文件系统一样，我们能够自由的增加、删除znode，在一个znode下增加、删除子znode，唯一的不同在于znode是可以存储数据的。ZNode根据持久化和序列化分为4种

| PERSISTENT 			| 持久化目录节点。客户端与zookeeper断开连接后，该节点依旧存在 |
| PERSISTENT_SEQUENTIAL	| 持久化顺序编号目录节点。客户端与zookeeper断开连接后，该节点依旧存在，只是Zookeeper给该节点名称进行顺序编号 |
| EPHEMERAL 			| 临时目录节点。客户端与zookeeper断开连接后，该节点被删除 |
| EPHEMERAL_SEQUENTIAL	| 临时顺序编号目录节点。客户端与zookeeper断开连接后，该节点被删除，只是Zookeeper给该节点名称进行顺序编号 |


工作原理
=======================================


参考资料
=======================================

百度百科：[zookeeper](http://baike.baidu.com/link?url=OB8b21xw3UldXVI0ghTO_cpEEw0BbjDlVtUJb4BoVpuCh7t6VmDP2MCxxt36KI4TK2ZzJ3a0oxkIrK5ozovm6h6F6UqDvu5CN7wanmGc-5W)

Zookeeper官方文档：[http://zookeeper.apache.org/doc/trunk/zookeeperOver.html](http://zookeeper.apache.org/doc/trunk/zookeeperOver.html)

zookeeper原理（转） : [http://cailin.iteye.com/blog/2014486/](http://cailin.iteye.com/blog/2014486/)

Zookeeper的功能以及工作原理 : [http://www.cnblogs.com/felixzh/p/5869212.html](http://www.cnblogs.com/felixzh/p/5869212.html)

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

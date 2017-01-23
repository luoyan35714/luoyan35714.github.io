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

| clientPort	| 该参数无默认值，必须配置，不支持系统属性方式配置。参数clientPort用于配置当前服务器对外的服务器端口，客户端会通过该端口和Zookeeper服务器创建连接，一般设置为2181。每台Zookeeper服务器都可以配置任意可用的端口，同时，集群中的所有服务器不需要保持clientPort端口一致。	|
| dataDir		| 该参数无默认值，必须配置，不支持系统属性方式配置。参数dataDir用于配置Zookeeper服务器存储快照文件的目录。默认情况下，如果没有配置参数dataLogDir,那么事务日志也会存储在这个目录中。考虑到事务日志的写性能直接影响Zookeeper整体的服务能力，因此建议同时通过参数dataLogDir来配置Zookeeper事务日志的存储目录。	|
| tickTime		| 该参数有默认值:3000，单位是毫秒(ms)，可以不配置，不支持系统属性方式配置。参数tickTime用于配置Zookeeper中最小事件单元的长度，很多运行时的时间间隔都是使用tickTime的倍数来表示的。例如，Zookeeper中会话的最小超时时间默认是2*tickTime.	|


高级配置
=================

> 系统属性方式配置：即在Java中，可以通过在启动的命令行参数中添加`-D`参数来达到配置系统属性的目的，例如`-Djava.library.path=/home/admin/jdk/lib`， 就是通过系统属性来配置`java.library.path`的。

| dataLogDir				| 该参数有默认值:dataDir,可以不配置，不支持系统属性方式配置。参数dataLogDir用于配置Zookeeper服务器存储事务日志文件的目录。默认情况下，Zookeeper会将事务日志文件和快照数据存储在同一个目录中，使用者应尽量将这两者的目录区分开来。另外，如果条件允许，可以将事务日志的存储配置在一个单独的磁盘上。事务日志记录对于磁盘的性能要求非常高，为了保证数据的一致性，Zookeeper在返回客户端事务请求响应之前，必须将本次请求对应的事务日志写入到磁盘中。因此事务日志写入的性能直接决定了Zookeeper在处理事务请求时的吞吐。针对同一块磁盘的其他并发读写操作(例如Zookeeper运行时日志输出和操作系统自身的读写等)，尤其是数据快照操作，会极大的影响事务日志的写性能。因此尽量给事务日志的输出配置一个单独的磁盘或是挂载点，将极大地提升Zookeeper的整体性能	|
| initLimit					| 该参数有默认值：10，即表示是参数tickTime值的10倍，必须配置，且需要配置一个正整数，不支持系统属性方式配置。该参数用于配置Leader服务器等待Follower启动，并完成数据同步的时间。Follower服务器在启动过程中，会与Leader建立连接并完成对数据的同步，从而确定自己对外提供服务的起始状态。通常情况下，运维人员不用太在意这个参数的配置，使用期默认值即可。但如果随着Zookeeper集群管理的数据量增大，Follower服务器在启动的时候，从Leader上进行同步数据的时间也会相应变长，于是无法在较短的时间完成数据同步。因此，在这种情况下，有必要适当调大这个参数。	|
| syncLimit					| 该参数有默认值：5，即表示是参数tickTime值的5倍，必须配置，且需要配置一个正整数，不支持系统属性当时配置。该参数用于配置Leader服务器和Follower之间进行心跳检测的最大延时事件。在Zookeeper集群运行过程中，Leader服务器会与所有的Follower进行心跳检测来确定该服务器是否存活。如果Leader服务器在syncLimit时间内无法获取到Follower的心跳检测响应，那么Leader就会认为该Follower已经脱离了和自己的同步。通常情况下，运维人员使用该参数的默认值即可，但如果部署Zookeeper集群的网络环境质量较低(例如网络延时较大或丢包严重)，那么可以适当调大这个参数。	|
| snapCount					| 该参数有默认值:100000,可以不配置，仅支持系统属性方式配置：zookeeper.snapCount。参数snapCount用于配置相邻两次数据快照之间的事务操作次数，即Zookeeper会在snapCount次事务操作之后进行一次数据快照。	|
| preAllocSize				| 该参数有默认值：65536，单位是KB，即64MB，可以不配置，仅支持系统属性方式配置：zookeeper.preAllocSize。参数preAlloSize用于配置Zookeeper事务日志文件预分配的磁盘空间大小。通常情况下，我们使用Zookeeper的默认配置65536KB即可，但是如果我们将参数snapCount设置得比默认值更小或更大，那么preAllocSize参数也要随之做出变更。举例来说：如果我们将snapCount的值设置为500，同时预估每次事务操作的数据量大小至多1KB，那么参数preAllocSize设置为500就足够了。	|
| minSessionTimeout/maxSessionTimeout			| 这两个参数有默认值，分别是参数tickTime值的2倍和20倍，即默认的会话超时时间在2*tickTime~20*tickTime范围内，单位毫秒，可以不配置，不支持系统属性方式配置。这两个参数用于服务端对客户端会话的超时时间进行限制，如果客户端设置的超时事件不再该范围内，那么会被服务端强制设置为最大或最小超时时间	|
| maxClientCnxns			| 该参数有默认值：60，可以不配置，不支持系统属性方式配置。从Socket层面限制单个客户端与单台服务器之间的并发连接数，即以IP地址粒度来进行连接数的限制。如果将该参数设置为0，则表示对连接数不做任何限制。需要注意该连接数限制选项的适用范围，其仅仅是对单台客户端机器与单台Zookeeper服务器之间的连接数限制，并不能控制所有客户端的连接数总和。另外，在3.4.0版本以前该参数的默认值都是10，从3.4.0版本开始变成了60，因此运维人员尤其需要注意这个变化，以防Zookeeper版本变化带来服务器连接数限制变化的隐患。	|
| jute.maxbuffer			| 该参数有默认值：1048575，单位是字节，可以不配置，仅支持系统属性方式配置：jute.maxbuffer。该参数用于配置单个数据节点(ZNode)上可以存储的最大数据量大小。通常情况下，运维人员不需要改动该参数，同时考虑到Zookeeper上不适宜存储太多的数据，往往还需要将该参数设置得更小。需要注意的是，在变更该参数的时候，需要在Zookeeper集群的所有机器以及所有的客户端上均设置才能生效。	|
| clientPortAddress			| 该参数没有默认值：可以不配置，不支持系统属性方式配置。针对那些多网卡的机器，该参数允许为每个IP地址制定不同的监听端口。	|
| server.id=host:port:port	| 该参数没有默认值，在单机模式下可以不配置，不支持系统属性方式配置。该参数用于配置组成Zookeeper集群的及其列表，其中id即为ServerID，与每台服务器myid文件中的数字相对应。同时，在该参数中，会配置两个端口：第一个端口用于指定Follower服务器与Leader进行运行时通信和数据同步时所使用的端口，第二个端口则专门用于进行Leader选举过程中的投票通信。在Zookeeper服务器启动的时候，其会根据myid文件中配置的ServerID来确定自己是哪台服务器，并使用对应配置的端口来进行启动。如果在实际使用过程中，需要在同一台服务器上部署多个Zookeeper实例来构成伪集群的话，那么这些端口都需要配制成不同。例如 `server.1=192.168.0.1:2777:3777`, `server.1=192.168.0.1:2888:3888`, `server.1=192.168.0.1:2999:3999`	|
| autopurge.snapRetainCount	| 该参数有默认值：3，可以不配置，不支持系统属性方式配置。从3.4.0版本开始，Zookeeper提供了对历史事务日志和快照数据自动清理的支持。参数autopurge.snapRetainCount用于配置Zookeeper在自动清理的时候需要保留的快照数据文件数量和对应的事务日志万能键。需要注意的是，并不是磁盘上的所有事务日志和快照数据文件都可以被清理掉--那样的话将无法恢复数据。因此参数autopurge.snapRetainCount的最小值是3，如果配置的autopurge.snapRetainCount值小于3的话，那么会被自动调整到3，即至少需要保留3个快照数据文件和对应的事务日志文件	|
| autopurge.purgeInteval	| 该参数有默认值：0，单位是小时，可以不配置，不支持系统属性方式配置。参数autopurge.purgeInterval和参数autopurge.snapRetainCount配套使用，用于配置Zookeeper进行历史文件自动清理的频率。如果配置该值为0或者负数，那么就表明不需要开启定时清理功能。Zookeeper默认不开启这项功能。	|
| fsync.warningthresholdms	| 该参数有默认值：1000，单位是毫秒，可以不配置，仅支持系统属性方式配置：fsync.warningthresholdms。参数fsync.warningthresholdms用于配置Zookeeper进行事务日志fsync操作时消耗时间的报警阈值。一旦进行一个fsync操作消耗的事件大于参数fsync.warningthresholdms指定的值，那么就在日志中打印出报警日志。	|
| forceSync					| 该参数有默认值：yes，可以不配置，可选配置项为`yes`和`no`，仅支持系统属性方式配置：zookeeper.forceSync。该参数用于配置Zookeeper服务器是否在事务提交的时候，将日志写入操作强制刷入磁盘(即调用java.nio.channels.FileChannel.force接口)，默认情况下是`yes`，即每次事务日志写入操作都会实时刷入磁盘。如果将其设置为`no`。则能一定程度的提高Zookeeper的写性能，但同事也会存在类似于机器断电这样的安全风险。	|
| globalOutstandingLimit	| 该参数有默认值：1000，可以不配置，仅支持系统属性方式配置：zookeeper.globalOutstandingLimit。参数globalOutstandingLimit用于配置Zookeeper服务器最大请求堆积数量。在Zookeeper服务器运行的过程中，客户端会源源不断的将请求发送到服务端，为了防止服务端资源(包括CPU,内存和网络等)耗尽，服务端必须限制同时处理的请求数，即最大请求堆积数量。	|
| leaderServes				|该参数有默认值：yes，可以不配置，可选配置项为`yes`和`no`，仅支持系统属性方式配置：zookeeper.leaderServes。该参数用于配置Leader服务器是否能够接受客户端的连接，即是否允许Leader向客户端提供服务，默认情况下，Leader服务器能够接受并处理客户端的所有读写请求。在Zookeeper的架构设计中，Leader服务器主要用来进行对事务更新请求的协调以及集群本身的运行时协调，因此，可以设置让Leader服务器不接受客户端的连接，以使其专注于进行分布式协调。	|
| SkipAcl					| 该参数有默认值：no，可以不配置，可选配置项为`yes`和`no`，仅支持系统属性方式配置：zookeeper.skipACL。该参数用于配置Zookeeper服务器是否跳过ACL权限检查，默认情况下是`no`，即会对每一个客户端请求进行权限检查。如果将其设置为`yes`，则能一定程度的提高Zookeeper的读写性能，但同时也会向所有客户端开放Zookeeper的数据，包括那些之前设置过ACL权限的数据节点，也将不再接收权限控制。	|
| xncTimeout				| 该参数有默认值：5000，单位是毫秒，可以不配置，仅支持系统属性方式配置：zookeeper.cnxTimeout。该参数用于配置在Leader选举过程中，各服务器之间进行TCP连接创建的超时时间。	|
| electionAlg				| 在之前的版本中，可以使用该参数来配置选择Zookeeper进行Leader选举时所使用的算法，但从3.4.0版本开始，Zookeeper废弃了其他选举算法，只留下了FastLeaderElection算法，因此该参数目前看来没有用了。	|


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

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Zookeeper官网：[http://zookeeper.apache.org/](http://zookeeper.apache.org/)

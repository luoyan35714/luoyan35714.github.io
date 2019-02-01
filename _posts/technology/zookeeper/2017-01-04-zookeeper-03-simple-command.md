---
layout:			post
title:			Zookeeper之(三) - zookeeper简单命令
date:			2017-01-06 14:08:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


四字命令
=======================================

conf
---------------------------------------

> New in 3.3.0

Print details about serving configuration.

输出服务配置的详细信息。

cons
---------------------------------------

> New in 3.3.0

List full connection/session details for all clients connected to this server. Includes information on numbers of packets received/sent, session id, operation latencies, last operation performed, etc...

列出所有连接到服务器的客户端的连接/会话的详细信息。包括接收/发送包数量、会话id、操作延迟、最后进行的操作等...

crst
---------------------------------------

> New in 3.3.0

Reset connection/session statistics for all connections.

重置所有连接的连接/会话统计信息。

dump
---------------------------------------

Lists the outstanding sessions and ephemeral nodes. This only works on the leader.

列出未经处理的会话和临时节点。此命令仅对leader有效。

envi
---------------------------------------

Print details about serving environment.

输出服务环境的详细信息。

ruok
---------------------------------------

Tests if server is running in a non-error state. The server will respond with imok if it is running. Otherwise it will not respond at all.

测试服务是否处于正确状态。如果确实如此，那么服务返回“ imok ”，否则不做任何相应

A response of "imok" does not necessarily indicate that the server has joined the quorum, just that the server process is active and bound to the specified client port. Use "stat" for details on state wrt quorum and client connection information.

srst
---------------------------------------

Reset server statistics.

重置服务器统计信息。

srvr
---------------------------------------

> New in 3.3.0

Lists full details for the server.

列出所有的服务器详细信息。

stat
---------------------------------------

Lists brief details for the server and connected clients.

输出服务器信息和连接客户端的概要列表。

wchs
---------------------------------------

> New in 3.3.0

Lists brief information on watches for the server.

列出服务器观察者的概要信息。

wchc
---------------------------------------

> New in 3.3.0

Lists detailed information on watches for the server, by session. This outputs a list of sessions(connections) with associated watches (paths). Note, depending on the number of watches this operation may be expensive (ie impact server performance), use it carefully.

通过session列出服务器观察者的详细信息，它的输出是一个与观察者(路径)相关的会话(连接)的列表。注意，取决于观察者的数量，此操作可能会非常消耗资源（影响服务器性能），请小心使用，

wchp
---------------------------------------

> New in 3.3.0

Lists detailed information on watches for the server, by path. This outputs a list of paths (znodes) with associated sessions. Note, depending on the number of watches this operation may be expensive (ie impact server performance), use it carefully.

通过路径列出服务器观察者的详细信息。它输出一个与 session相关的路径(节点)。注意，取决于观察者的数量，此操作可能会非常消耗资源（影响服务器性能），请小心使用，

mntr
---------------------------------------

> New in 3.4.0

Outputs a list of variables that could be used for monitoring the health of the cluster.

输出一份可以监控集群健康状态的变量列表。

四字命令使用方法
---------------------------------------

{% highlight bash %}
[root@localhost bin]# echo stat | nc localhost 2181
Zookeeper version: 3.4.9-1757313, built on 08/23/2016 06:50 GMT
Clients:
 /0:0:0:0:0:0:0:1:57843[0](queued=0,recved=1,sent=0)

Latency min/avg/max: 0/0/0
Received: 2
Sent: 1
Connections: 1
Outstanding: 0
Zxid: 0x400000001
Mode: follower
Node count: 5
{% endhighlight %}


zkClient使用命令
=======================================

客户端连接
---------------------------------------

{% highlight bash %}
[root@databus bin]# ./zkCli.sh -server localhost:2181
{% endhighlight %}

ls
---------------------------------------

列出某路径下所有节点

> ls path [watch]

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 0] ls /  
[test, zookeeper]
{% endhighlight %}

create
---------------------------------------

创建节点

> create [-s] [-e] path data acl

{% highlight bash %}
# -s 代表自动编号
# -e 代表临时节点，当创建这个znode的Client与Server断开连接，此节点自动删除
[zk: localhost:2181(CONNECTED) 1] create /freud hifreud
Created /freud
{% endhighlight %}

get
---------------------------------------

获取节点信息

> get path [watch]

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 2] get /freud
hifreud
cZxid = 0x40000000f
ctime = Fri Jan 06 15:00:42 CST 2017
mZxid = 0x40000000f
mtime = Fri Jan 06 15:00:42 CST 2017
pZxid = 0x40000000f
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 7
numChildren = 0
{% endhighlight %}

set
---------------------------------------

为节点重新赋值

> set path data [version]

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 3] set /freud 'hi again freud'
cZxid = 0x40000000f
ctime = Fri Jan 06 15:00:42 CST 2017
mZxid = 0x400000011
mtime = Fri Jan 06 15:01:05 CST 2017
pZxid = 0x40000000f
cversion = 0
dataVersion = 1
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 14
numChildren = 0
{% endhighlight %}

delete 
---------------------------------------

删除节点

> delete path [version]

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 9] delete /freud
{% endhighlight %}

history
---------------------------------------

查看执行命令历史记录

> history

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 10] history
0 - ls /
1 - create /freud hifreud
2 - get /freud
3 - set /freud 'hi again freud'
4 - delete /freud
5 - history
{% endhighlight %}

redo
---------------------------------------

重做某一步

> redo cmdno

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 14] redo 1
Created /freud
{% endhighlight %}

stat
---------------------------------------

打印节点状态

> stat path [watch]

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 15] stat /freud
cZxid = 0x400000013
ctime = Fri Jan 06 15:03:12 CST 2017
mZxid = 0x400000013
mtime = Fri Jan 06 15:03:12 CST 2017
pZxid = 0x400000013
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 7
numChildren = 0
{% endhighlight %}

close 
---------------------------------------

关闭当前连接

> close 

connect
---------------------------------------

当close当前连接或者以外退出后，可以继续在zkCli的命令模式下连接。

> connect host:port

{% highlight bash %}
connect localhost:2181
{% endhighlight %}

quit
---------------------------------------

退出当前会话

> quit

setAcl path acl
---------------------------------------

为某个节点设置ACL权限。

> setAcl path acl

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 1] setAcl /hifreud world:anyone:cdwra
cZxid = 0x5
ctime = Thu Jun 08 09:56:28 CST 2017
mZxid = 0x5
mtime = Thu Jun 08 09:56:28 CST 2017
pZxid = 0x5
cversion = 0
dataVersion = 0
aclVersion = 1
ephemeralOwner = 0x0
dataLength = 7
numChildren = 0
{% endhighlight %}

getAcl path
---------------------------------------

查看某个节点的ACL权限。

> getAcl path

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 2] getAcl /hifreud
'world,'anyone
: cdrwa
{% endhighlight %}

addauth scheme auth
---------------------------------------

添加认证信息，类似于登录。如果某个节点需要认证后才能查看，则需要此命令。

> addauth scheme auth

{% highlight bash %}
addauth digest admin:admin
{% endhighlight %}

不常用
---------------------------------------

+ rmr path
+ ls2 path [watch]
+ listquota path
+ sync path
+ <p>delquota [-n|-b] path</p>
+ <p>printwatches on|off</p>
+ <p>setquota -n|-b val path</p>


参考资料
=======================================

百度百科：[zookeeper](http://baike.baidu.com/link?url=OB8b21xw3UldXVI0ghTO_cpEEw0BbjDlVtUJb4BoVpuCh7t6VmDP2MCxxt36KI4TK2ZzJ3a0oxkIrK5ozovm6h6F6UqDvu5CN7wanmGc-5W)

Zookeeper官网：[http://zookeeper.apache.org/](http://zookeeper.apache.org/)

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

ZooKeeper Commands: The Four Letter Words [http://zookeeper.apache.org/doc/r3.4.9/zookeeperAdmin.html#sc_zkCommands](http://zookeeper.apache.org/doc/r3.4.9/zookeeperAdmin.html#sc_zkCommands)

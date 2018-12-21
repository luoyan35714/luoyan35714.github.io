---
layout:			post
title:			Zookeeper之(二) - Zookeeper安装
date:			2017-01-05 14:05:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


单机安装
=======================================

JDK
---------------------------------------

在安装Zookeeper之前首先要确保已经正确安装了JDK，关于JDK的安装就不做描述，只列出在不同环境下JDK的配置。

+ Windows：在环境变量中添加${jdk_path}\bin目录
+ Linux：在`/etc/profile`文件最后添加如下代码，并保存文件
{% highlight bash %}
JAVA_HOME=${jdk_path}
CLASSPATH=.:$JAVA_HOME/lib/
PATH=$PATH:$JAVA_HOME/bin:
export JAVA_HOME CLASSPATH PATH
{% endhighlight %}

Windows
---------------------------------------

从[Zookeeper官网](http://zookeeper.apache.org/)下载最新稳定版本，当前是[3.4.9](http://mirrors.cnnic.cn/apache/zookeeper/zookeeper-3.4.9/zookeeper-3.4.9.tar.gz)。

解压下载的文件到指定目录，然后在Windows Command下切换到此目录

{% highlight bash %}
C:\programs>cd zookeeper-3.4.9
C:\programs\zookeeper-3.4.9>
{% endhighlight %}

执行`start..`打开文件夹并拷贝`zookeeper-3.4.9\conf\zoo_sample.cfg`文件命名为`zookeeper-3.4.9\conf\zoo.cfg`,修改其中`dataDir`为`dataDir=c:/zookeeper`，其中几个参数释义如下

| tickTime		| zookeeper中使用的基本时间,单位毫秒.										|
| dataDir		| 数据目录. 可以是任意目录.														|
| dataLogDir	| log目录, 同样可以是任意目录. 如果没有设置该参数, 将使用和dataDir相同的设置.	|
| clientPort	| 监听client连接的端口号.														|

然后在命令行切换到`zookeeper-3.4.9\bin`目录下执行`zkServer.cmd`命令,启动Windows单机版Zookeeper

{% highlight bash %}
C:\programs\zookeeper-3.4.9\bin>zkServer.cmd

C:\programs\zookeeper-3.4.9\bin>call "C:\Program Files (x86)\Java\jdk1.7.0_71"\b
in\java "-Dzookeeper.log.dir=C:\programs\zookeeper-3.4.9\bin\.." "-Dzookeeper.ro
ot.logger=INFO,CONSOLE" -cp "C:\programs\zookeeper-3.4.9\bin\..\build\classes;C:
\programs\zookeeper-3.4.9\bin\..\build\lib\*;C:\programs\zookeeper-3.4.9\bin\..\
*;C:\programs\zookeeper-3.4.9\bin\..\lib\*;C:\programs\zookeeper-3.4.9\bin\..\co
nf" org.apache.zookeeper.server.quorum.QuorumPeerMain "C:\programs\zookeeper-3.4
.9\bin\..\conf\zoo.cfg"
2017-01-06 09:49:16,595 [myid:] - INFO  [main:QuorumPeerConfig@124] - Reading co
nfiguration from: C:\programs\zookeeper-3.4.9\bin\..\conf\zoo.cfg
2017-01-06 09:49:16,595 [myid:] - INFO  [main:DatadirCleanupManager@78] - autopu
rge.snapRetainCount set to 3
2017-01-06 09:49:16,595 [myid:] - INFO  [main:DatadirCleanupManager@79] - autopu
rge.purgeInterval set to 0
2017-01-06 09:49:16,595 [myid:] - INFO  [main:DatadirCleanupManager@101] - Purge
 task is not scheduled.
2017-01-06 09:49:16,595 [myid:] - WARN  [main:QuorumPeerMain@113] - Either no co
nfig or no quorum defined in config, running  in standalone mode
2017-01-06 09:49:16,641 [myid:] - INFO  [main:QuorumPeerConfig@124] - Reading co
nfiguration from: C:\programs\zookeeper-3.4.9\bin\..\conf\zoo.cfg
2017-01-06 09:49:16,641 [myid:] - INFO  [main:ZooKeeperServerMain@96] - Starting
 server
2017-01-06 09:49:16,641 [myid:] - INFO  [main:Environment@100] - Server environm
ent:zookeeper.version=3.4.9-1757313, built on 08/23/2016 06:50 GMT
2017-01-06 09:49:16,641 [myid:] - INFO  [main:Environment@100] - Server environm
ent:host.name=freud-PC
2017-01-06 09:49:16,641 [myid:] - INFO  [main:Environment@100] - Server environm
ent:java.version=1.7.0_71
2017-01-06 09:49:16,641 [myid:] - INFO  [main:Environment@100] - Server environm
ent:java.vendor=Oracle Corporation
2017-01-06 09:49:16,641 [myid:] - INFO  [main:Environment@100] - Server environm
ent:java.home=C:\Program Files (x86)\Java\jdk1.7.0_71\jre
2017-01-06 09:49:16,641 [myid:] - INFO  [main:Environment@100] - Server environm
ent:java.class.path=C:\programs\zookeeper-3.4.9\bin\..\build\classes;C:\programs
\zookeeper-3.4.9\bin\..\build\lib\*;C:\programs\zookeeper-3.4.9\bin\..\zookeeper
-3.4.9.jar;C:\programs\zookeeper-3.4.9\bin\..\lib\jline-0.9.94.jar;C:\programs\z
ookeeper-3.4.9\bin\..\lib\log4j-1.2.16.jar;C:\programs\zookeeper-3.4.9\bin\..\li
b\netty-3.10.5.Final.jar;C:\programs\zookeeper-3.4.9\bin\..\lib\slf4j-api-1.6.1.
jar;C:\programs\zookeeper-3.4.9\bin\..\lib\slf4j-log4j12-1.6.1.jar;C:\programs\z
ookeeper-3.4.9\bin\..\conf
2017-01-06 09:49:16,641 [myid:] - INFO  [main:Environment@100] - Server environm
ent:java.library.path=C:\Program Files (x86)\Java\jdk1.7.0_71\bin;C:\windows\Sun
\Java\bin;C:\windows\system32;C:\windows;C:\Program Files (x86)\Common Files\Net
Sarang;C:\Program Files (x86)\Intel\iCLS Client\;C:\Program Files\Intel\iCLS Cli
ent\;C:\windows\system32;C:\windows;C:\windows\System32\Wbem;C:\windows\System32
\WindowsPowerShell\v1.0\;C:\Program Files\Intel\Intel(R) Management Engine Compo
nents\DAL;C:\Program Files\Intel\Intel(R) Management Engine Components\IPT;C:\Pr
ogram Files (x86)\Intel\Intel(R) Management Engine Components\DAL;C:\Program Fil
es (x86)\Intel\Intel(R) Management Engine Components\IPT;C:\Program Files (x86)\
nodejs\;C:\Program Files\TortoiseSVN\bin;C:\Program Files (x86)\Git\cmd;C:\Progr
am Files (x86)\Git\bin;C:\programs\Tesseract-OCR;C:\Program Files\MongoDB\Server
\3.0\bin;C:\Program Files\PostgreSQL\9.4\bin;C:\Program Files (x86)\Sublime Text
 3;C:\Ruby22-x64\bin;C:\Python34;C:\Program Files (x86)\Java\jdk1.7.0_71\bin;C:\
programs\apache-maven-3.3.3\bin;D:\tools\casperjs-master\bin;D:\tools\phantomjs\
phantomjs-1.9.8-windows;C:\programs\apache-ant-1.9.4\bin;C:\programs\axis2-1.6.2
/bin;.
2017-01-06 09:49:16,657 [myid:] - INFO  [main:Environment@100] - Server environm
ent:java.io.tmpdir=C:\Users\freud\AppData\Local\Temp\
2017-01-06 09:49:16,657 [myid:] - INFO  [main:Environment@100] - Server environm
ent:java.compiler=<NA>
2017-01-06 09:49:16,657 [myid:] - INFO  [main:Environment@100] - Server environm
ent:os.name=Windows 7
2017-01-06 09:49:16,657 [myid:] - INFO  [main:Environment@100] - Server environm
ent:os.arch=x86
2017-01-06 09:49:16,657 [myid:] - INFO  [main:Environment@100] - Server environm
ent:os.version=6.1
2017-01-06 09:49:16,657 [myid:] - INFO  [main:Environment@100] - Server environm
ent:user.name=freud
2017-01-06 09:49:16,657 [myid:] - INFO  [main:Environment@100] - Server environm
ent:user.home=C:\Users\freud
2017-01-06 09:49:16,657 [myid:] - INFO  [main:Environment@100] - Server environm
ent:user.dir=C:\programs\zookeeper-3.4.9\bin
2017-01-06 09:49:16,673 [myid:] - INFO  [main:ZooKeeperServer@815] - tickTime se
t to 2000
2017-01-06 09:49:16,673 [myid:] - INFO  [main:ZooKeeperServer@824] - minSessionT
imeout set to -1
2017-01-06 09:49:16,673 [myid:] - INFO  [main:ZooKeeperServer@833] - maxSessionT
imeout set to -1
2017-01-06 09:49:16,704 [myid:] - INFO  [main:NIOServerCnxnFactory@89] - binding
 to port 0.0.0.0/0.0.0.0:2181
{% endhighlight %}

重新打开一个command并切到zookeeper安装目录的bin目录下，执行`zkCli.cmd -server localhost:2181`验证是否正常启动。

Linux
---------------------------------------

从[Zookeeper官网](http://zookeeper.apache.org/)下载最新稳定版本，当前是[3.4.9](http://mirrors.cnnic.cn/apache/zookeeper/zookeeper-3.4.9/zookeeper-3.4.9.tar.gz)，并解压。

{% highlight bash %}
[root@localhost freud]# wget http://mirrors.cnnic.cn/apache/zookeeper/zookeeper-3.4.9/zookeeper-3.4.9.tar.gz
[root@localhost freud]# tar -zxvf zookeeper-3.4.9.tar.gz
{% endhighlight %}

拷贝`zookeeper-3.4.9\conf\zoo_sample.cfg`文件命名为`zookeeper-3.4.9\conf\zoo.cfg`

然后在命令行切换到`zookeeper-3.4.9\bin`目录下,添加脚本命令执行权限，并执行`zkServer.sh`命令,启动Linux单机版Zookeeper

{% highlight bash %}
[root@localhost freud]# cd zookeeper-3.4.9
[root@localhost zookeeper-3.4.9]# cd conf/
[root@localhost conf]# cp zoo_sample.cfg zoo.cfg
[root@localhost conf]# cd ../bin/
[root@localhost bin]# chmod +x *.sh
[root@localhost bin]# ./zkServer.sh  start
ZooKeeper JMX enabled by default
Using config: /root/freud/zookeeper-3.4.9/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED
[root@localhost bin]# 
{% endhighlight %}

执行`zkCli.sh -server localhost:2181`验证是否正常启动。

伪集群
=======================================

伪集群即在单台机器中启动多个zookeeper进程, 并组成一个集群. 以下以Linux下部署三个节点为例。

拷贝三份zookeeper，并按照如下修改对应的`conf\zoo.cfg`文件

修改zoo.cfg文件
---------------------------------------

{% highlight bash %}
[root@localhost freud]# mv zookeeper-3.4.9 zookeeper-3.4.9_1
[root@localhost freud]# cp zookeeper-3.4.9_1/ zookeeper-3.4.9_2 -r
[root@localhost freud]# cp zookeeper-3.4.9_1/ zookeeper-3.4.9_3 -r
{% endhighlight %}

+ vi zookeeper-3.4.9_1/conf/zoo.cfg

{% highlight bash %}
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper/data_1
dataLogDir=/tmp/zookeeper/log_1
clientPort=2181
server.1=localhost:2281:2282
server.2=localhost:2381:2382
server.3=localhost:2481:2482
{% endhighlight %}

+ vi zookeeper-3.4.9_2/conf/zoo.cfg

{% highlight bash %}
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper/data_2
dataLogDir=/tmp/zookeeper/log_2
clientPort=2182
server.1=localhost:2281:2282
server.2=localhost:2381:2382
server.3=localhost:2481:2482
{% endhighlight %}

+ vi zookeeper-3.4.9_3/conf/zoo.cfg

{% highlight bash %}
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper/data_3
dataLogDir=/tmp/zookeeper/log_3
clientPort=2183
server.1=localhost:2281:2282
server.2=localhost:2381:2382
server.3=localhost:2481:2482
{% endhighlight %}


| initLimit			| zookeeper集群中的包含多台server, 其中一台为leader, 集群中其余的server为follower. initLimit参数配置初始化连接时, follower和leader之间的最长心跳时间. 此时该参数设置为10, 说明时间限制为10倍tickTime, 即10*2000=20000ms=20s.|
| syncLimit			| 该参数配置leader和follower之间发送消息, 请求和应答的最大时间长度. 此时该参数设置为5, 说明时间限制为5倍tickTime, 即10000ms=10s.|
| server.id=host:portA:portB 	| 其中id被称为Server ID是一个1-255之间的数字,用来标识该机器在集群中的机器序号，并对应myid中的数字。host是该server所在的IP地址. hostA配置该server和集群中的leader交换消息所使用的端口. hostB配置选举leader时所使用的端口. 由于配置的是伪集群模式, 所以各个server的hostA, hostB参数必须不同. |


创建`data`和`log`目录
---------------------------------------

{% highlight bash %}
[root@localhost freud]# mkdir /tmp/zookeeper/data_1
[root@localhost freud]# mkdir /tmp/zookeeper/log_1
[root@localhost freud]# mkdir /tmp/zookeeper/data_2
[root@localhost freud]# mkdir /tmp/zookeeper/log_2
[root@localhost freud]# mkdir /tmp/zookeeper/data_3
[root@localhost freud]# mkdir /tmp/zookeeper/log_3
{% endhighlight %}

创建myid文件
---------------------------------------

{% highlight bash %}
# 写入1
[root@localhost freud]# vi /tmp/zookeeper/data_1/myid
# 写入2
[root@localhost freud]# vi /tmp/zookeeper/data_2/myid
# 写入3
[root@localhost freud]# vi /tmp/zookeeper/data_3/myid
{% endhighlight %}

启动
---------------------------------------
{% highlight bash %}
[root@localhost freud]# cd ~/freud/zookeeper-3.4.9_1/bin/
[root@localhost bin]# ./zkServer.sh start
ZooKeeper JMX enabled by default
Using config: /root/freud/zookeeper-3.4.9_1/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED
[root@localhost freud]# cd ~/freud/zookeeper-3.4.9_2/bin/
[root@localhost bin]# ./zkServer.sh start
ZooKeeper JMX enabled by default
Using config: /root/freud/zookeeper-3.4.9_1/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED
[root@localhost freud]# cd ~/freud/zookeeper-3.4.9_3/bin/
[root@localhost bin]# ./zkServer.sh start
ZooKeeper JMX enabled by default
Using config: /root/freud/zookeeper-3.4.9_1/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED
# jps 发现3个QuorumPeerMain进程代表启动成功
[root@localhost bin]# jps
4488 Jps
4344 QuorumPeerMain
4376 QuorumPeerMain
4442 QuorumPeerMain
{% endhighlight %}

验证
----------------------------------------

为了验证配置安装是否正确，在zookeeper实例1下创建一个目录，然后通过zkCli在另外两个zookeeper实例下看能否查看到。

{% highlight bash %}
[root@localhost bin]# ./zkCli.sh -server localhost:2181
[zk: localhost:2181(CONNECTED) 6] create /test helloworld
Created /test
[root@localhost bin]# ./zkCli.sh -server localhost:2182
[zk: localhost:2182(CONNECTED) 0] ls /
[test, zookeeper]
[zk: localhost:2182(CONNECTED) 2] get /test
helloworld
cZxid = 0x200000002
ctime = Fri Jan 06 10:59:07 CST 2017
mZxid = 0x200000002
mtime = Fri Jan 06 10:59:07 CST 2017
pZxid = 0x200000002
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 10
numChildren = 0
[root@localhost bin]# ./zkCli.sh -server localhost:2183
[zk: localhost:2183(CONNECTED) 0] ls /
[test, zookeeper]
[zk: localhost:2183(CONNECTED) 1] get /test
helloworld
cZxid = 0x200000002
ctime = Fri Jan 06 10:59:07 CST 2017
mZxid = 0x200000002
mtime = Fri Jan 06 10:59:07 CST 2017
pZxid = 0x200000002
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 10
numChildren = 0
{% endhighlight %}

集群
=======================================

集群的配置与伪集群基本类似，由于集群模式下，各个Zookeeper部署在不同的机器上，所以zoo.cfg可以配置为完全一致。

{% highlight bash %}
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper
dataLogDir=/tmp/zookeeper
clientPort=2181
server.123=192.168.1.123:2281:2282
server.124=192.168.1.124:2281:2282
server.125=192.168.1.125:2281:2282
{% endhighlight %}

需要注意的各Server的dataDir下myid中的内容必须与zoo.cfg中配置的一致，并且不能重复。


参考资料
=======================================

百度百科：[zookeeper](http://baike.baidu.com/link?url=OB8b21xw3UldXVI0ghTO_cpEEw0BbjDlVtUJb4BoVpuCh7t6VmDP2MCxxt36KI4TK2ZzJ3a0oxkIrK5ozovm6h6F6UqDvu5CN7wanmGc-5W)

Zookeeper官网：[http://zookeeper.apache.org/](http://zookeeper.apache.org/)

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Zookeeper 安装和配置: [http://coolxing.iteye.com/blog/1871009](http://coolxing.iteye.com/blog/1871009)

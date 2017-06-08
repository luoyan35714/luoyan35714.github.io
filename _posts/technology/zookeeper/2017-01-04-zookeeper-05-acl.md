---
layout:			post
title:			Zookeeper学习笔记之(五) - zookeeper ACL
date:			2017-01-08 14:14:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


四种权限策略
===================

| world  | 有个单一的ID，anyone，表示任何人。 |
| auth   | 不使用任何ID，表示任何通过验证的用户（验证是指创建该znode的权限）。 |
| digest | 用 username:password 字符串来产生一个MD5串，然后该串被用来作为ACL ID。认证是通过明文发送username:password 来进行的，当用在ACL时，表达式为username:base64 ，base64是password的SHA1摘要的编码。 |
| ip     | 使用客户端的主机IP作为ACL ID 。这个ACL表达式的格式为addr/bits ，此时addr中的有效位与客户端addr中的有效位进行比对。 |

四种权限操作
===================

+ CREATE：创建子节点的权限，缩写'c'
+ READ：获取节点数据和子节点列表的权限，缩写'r'
+ WRITE：更新节点数据的权限，缩写'w'
+ DELETE：删除子节点的权限，缩写'd'
+ ADMIN：设置节点ACL权限，缩写'a'

world权限
===================

即该节点对任何人都有权限，在不指定权限状态下创建的所有节点都是world权限。

{% highlight bash %}
[zk: localhost:2181(CONNECTED) 8] create /hifreud www.hifreud.com
Created /hifreud
[zk: localhost:2181(CONNECTED) 9] getAcl /hifreud
'world,'anyone
: cdrwa
{% endhighlight %}


digest权限
===================

这是一种使用用户名和密码登录的权限，而密码的存储是一个摘要串，计算规则如下,假设ID和密码是"admin:admin",则：

{% highlight java %}
// admin:x1nq8J5GOJVPY6zgzhtTtA9izLc=
DigestAuthenticationProvider.generateDigest("admin:admin");

//源码，其中base64的计算方式跟JDK默认的Base64不同，需要注意！
static public String generateDigest(String idPassword)
            throws NoSuchAlgorithmException {
    String parts[] = idPassword.split(":", 2);
    byte digest[] = MessageDigest.getInstance("SHA1").digest(
            idPassword.getBytes());
    return parts[0] + ":" + base64Encode(digest);
}
{% endhighlight %}

所以可以做如下的digest操作进行测试：

{% highlight bash %}
# 创建节点/hifreud
[zk: localhost:2181(CONNECTED) 14] create /hifreud www.hifreud.com
Created /hifreud
# 查看/hifreud节点的权限
[zk: localhost:2181(CONNECTED) 25] getAcl /hifreud
'world,'anyone
: cdrwa
# 添加id和密码为"admin:admin"
[zk: localhost:2181(CONNECTED) 16] setAcl /hifreud digest:admin:x1nq8J5GOJVPY6zgzhtTtA9izLc=:cdrwa
cZxid = 0x57
ctime = Thu Jun 08 14:37:58 CST 2017
mZxid = 0x57
mtime = Thu Jun 08 14:37:58 CST 2017
pZxid = 0x57
cversion = 0
dataVersion = 0
aclVersion = 1
ephemeralOwner = 0x0
dataLength = 15
numChildren = 0
# 使用admin:admin进行登录
[zk: localhost:2181(CONNECTED) 17] addauth digest admin:admin
# 查看/hifreud节点的权限
[zk: localhost:2181(CONNECTED) 18] getAcl /hifreud
'digest,'admin:x1nq8J5GOJVPY6zgzhtTtA9izLc=
: cdrwa
# 删除/hifreud节点
[zk: localhost:2181(CONNECTED) 19] delete /hifreud
{% endhighlight %}


auth权限
===================

auth权限可以理解为是对digest的一种补充，当处于登录状态的时候，可以直接为节点添加当前ID的权限，而不需要输入ID和密码。不过需要注意的是，如果没有登录状态而要设置auth权限则会报错。

{% highlight bash %}
# 创建节点/hifreud
[zk: localhost:2181(CONNECTED) 21] create /hifreud www.hifreud.com
Created /hifreud
# 查看/hifreud节点的权限
[zk: localhost:2181(CONNECTED) 22] getAcl /hifreud
'world,'anyone
: cdrwa
# 使用admin:admin登录
[zk: localhost:2181(CONNECTED) 23] addauth digest admin:admin
# 设置auth权限
[zk: localhost:2181(CONNECTED) 24] setAcl /hifreud auth::cdrwa
cZxid = 0x5a
ctime = Thu Jun 08 14:44:42 CST 2017
mZxid = 0x5a
mtime = Thu Jun 08 14:44:42 CST 2017
pZxid = 0x5a
cversion = 0
dataVersion = 0
aclVersion = 1
ephemeralOwner = 0x0
dataLength = 15
numChildren = 0
# 查看/hifreud节点的权限
[zk: localhost:2181(CONNECTED) 25] getAcl /hifreud
'digest,'admin:x1nq8J5GOJVPY6zgzhtTtA9izLc=
: cdrwa
# 删除节点/hifreud
[zk: localhost:2181(CONNECTED) 26] delete /hifreud
{% endhighlight %}


ip权限
===================

使用客户端IP作为ACL ID进行权限验证
{% highlight bash %}
# 创建节点/hifreud
[zk: localhost:2181(CONNECTED) 4] create /hifreud www.hifreud.com
Created /hifreud
# 查看/hifreud节点的权限
[zk: localhost:2181(CONNECTED) 6] getAcl /hifreud
'world,'anyone
: cdrwa
# 设置IP权限
[zk: localhost:2181(CONNECTED) 7] setAcl /hifreud ip:127.0.0.1:cdrwa
cZxid = 0x68
ctime = Thu Jun 08 14:53:58 CST 2017
mZxid = 0x68
mtime = Thu Jun 08 14:53:58 CST 2017
pZxid = 0x68
cversion = 0
dataVersion = 0
aclVersion = 1
ephemeralOwner = 0x0
dataLength = 15
numChildren = 0
# 查看/hifreud节点的权限
[zk: localhost:2181(CONNECTED) 8] getAcl /hifreud
'ip,'127.0.0.1
: cdrwa
# 删除节点/hifreud
[zk: localhost:2181(CONNECTED) 26] delete /hifreud
{% endhighlight %}


参考资料
===================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Zookeeper官网：[http://zookeeper.apache.org/](http://zookeeper.apache.org/)

使用ZooKeeper ACL特性进行znode控制 ：[使用ZooKeeper ACL特性进行znode控制](http://aiilive.blog.51cto.com/1925756/1686132)

zookeeper学习笔记1 : [zookeeper学习笔记1](http://5ydycm.blog.51cto.com/115934/1591768/)
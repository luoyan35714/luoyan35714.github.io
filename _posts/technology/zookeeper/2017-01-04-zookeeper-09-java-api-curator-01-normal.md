---
layout:			post
title:			Zookeeper之(九) - zookeeper java API - curator - 01 - 基础API
date:			2017-01-12 14:26:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


Curator简介
=======================================

Curator是Netflix公司开源的一套Zookeeper客户端，作者是Jordan Zimmerman。和Zkclient一样，Curator解决了很多Zookeeper客户端非常底层的细节开发工作，包括自动重连，反复注册Watcher和NodeExistsException异常等，目前已经成为了Apache的顶级项目，是全世界范围内使用最广泛的Zookeeper客户端之一。

除了封装一些开发人员不需要特别关注的底层细节之外，Curator还在Zookeeper原生API的基础上进行了包装，提供了一套易用性和可读性更强的Fluent冯哥的客户端API框架。

除此之外，Curator中还提供了Zookeeper各种应用场景(Recipe,如共享锁服务，Master选举机制和分布式计数器等)的抽象封装。


Curator Maven依赖
=======================================

{% highlight xml %}
<dependency>
	<groupId>org.apache.curator</groupId>
	<artifactId>curator-framework</artifactId>
	<version>2.11.1</version>
</dependency>

<dependency>
	<groupId>org.apache.curator</groupId>
	<artifactId>curator-recipes</artifactId>
	<version>2.11.1</version>
</dependency>

<dependency>
	<groupId>org.apache.curator</groupId>
	<artifactId>curator-client</artifactId>
	<version>2.11.1</version>
</dependency>
{% endhighlight %}


Curator基础API
=======================================

简单示例内容
-----------------

+ 创建连接，创建连接中RetryPolicy重试策略默认有5种实现。

| ExponentialBackoffRetry 			| Retry policy that retries a set number of times with increasing sleep time between retries 							|
| BoundedExponentialBackoffRetry 	| Retry policy that retries a set number of times with an increasing (up to a maximum bound) sleep time between retries |
| RetryNTimes 						| Retry policy that retries a max number of times 																		|
| RetryOneTime 						| A retry policy that retries only once 																				|
| RetryUntilElapsed 				| A retry policy that retries until a given amount of time elapses														|

+ 创建节点
+ 创建子节点，支持递归创建
+ 修改节点数据
+ 获取节点数据
+ 强制删除节点，guaranteed()表示如果当前客户端会话有效，则Curator会在后台持续进行删除操作，直至节点删除成功为止。
+ 递归删除节点


代码
-----------------

{% highlight java %}
package com.freud.zk.curator;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.api.CuratorEvent;
import org.apache.curator.framework.api.CuratorListener;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.framework.state.ConnectionStateListener;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.data.Stat;

/**
 * 
 * Zookeeper - Curator
 * 
 * @author Freud
 *
 */
public class CuratorNormalZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {
		// 节点
		String root = "/hifreud";
		String path = root + "/sayhi";
		String path2 = root + "/sayhello";
		String data = "hi freud";
		String dataAgain = "hi freud again!";

		// 创建连接
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Server connected...");

		// 添加节点操作监听事件
		cfFluent.getCuratorListenable().addListener(new CuratorListener() {
			@Override
			public void eventReceived(CuratorFramework curatorFramework, CuratorEvent event) throws Exception {
				System.out.println("Curator framework operations : " + event.getType().toString());
			}
		});
		// 添加连接信息监听事件
		cfFluent.getConnectionStateListenable().addListener(new ConnectionStateListener() {
			@Override
			public void stateChanged(CuratorFramework arg0, ConnectionState arg1) {
				System.out.println("Connection state changed to : " + arg1.name());
			}
		});
		System.out.println("Listener added success...");

		Thread.sleep(1 * SECOND);
		if (cfFluent.checkExists().forPath(path) == null) {
			// 创建节点
			cfFluent.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(path, data.getBytes());
			System.out.println("Created node [" + path + "] with data [" + data + "]");
		}

		Thread.sleep(1 * SECOND);
		if (cfFluent.checkExists().forPath(path2) == null) {
			// 创建节点
			cfFluent.create().withMode(CreateMode.PERSISTENT).forPath(path2, data.getBytes());
			System.out.println("Created node [" + path2 + "] with data [" + data + "]");
		}

		Thread.sleep(1 * SECOND);
		if (cfFluent.checkExists().forPath(path) != null) {
			// 获取节点内容
			Stat stat = new Stat();
			System.out.println("Read from node [" + path + "] data : "
					+ new String(cfFluent.getData().storingStatIn(stat).forPath(path)));
			System.out.println("\tversion : " + stat.getVersion());
			System.out.println("\tczxid : " + stat.getCzxid());
			System.out.println("\taversion : " + stat.getAversion());
			System.out.println("\tmzxid : " + stat.getMzxid());
		}

		Thread.sleep(1 * SECOND);
		if (cfFluent.checkExists().forPath(path) != null) {
			// 设置节点内容
			cfFluent.setData().forPath(path, dataAgain.getBytes());
			System.out.println("Set data to node [" + path + "] data : " + dataAgain);
		}

		Thread.sleep(1 * SECOND);
		if (cfFluent.checkExists().forPath(path) != null) {
			// 获取节点内容
			Stat stat = new Stat();
			System.out.println("Read from node after change [" + path + "] data : "
					+ new String(cfFluent.getData().storingStatIn(stat).forPath(path)));
			System.out.println("\tversion : " + stat.getVersion());
			System.out.println("\tczxid : " + stat.getCzxid());
			System.out.println("\taversion : " + stat.getAversion());
			System.out.println("\tmzxid : " + stat.getMzxid());
		}

		Thread.sleep(1 * SECOND);
		if (cfFluent.checkExists().forPath(path2) != null) {
			// 强制删除节点
			cfFluent.delete().guaranteed().forPath(path2);
			System.out.println("Delete node [" + path2 + "].");
		}

		Thread.sleep(1 * SECOND);
		if (cfFluent.checkExists().forPath(root) != null) {
			// 递归删除节点
			cfFluent.delete().deletingChildrenIfNeeded().forPath(root);
			System.out.println("Delete node [" + root + "] use recursion.");
		}

		Thread.sleep(2 * SECOND);
		System.out.println("Server closed...");
	}
}
{% endhighlight %}

打印结果
-----------------

{% highlight text %}
Server connected...
Listener added success...
Connection state changed to : CONNECTED
Curator framework operations : WATCHED
Created node [/hifreud/sayhi] with data [hi freud]
Created node [/hifreud/sayhello] with data [hi freud]
Read from node [/hifreud/sayhi] data : hi freud
	version : 0
	czxid : 11396
	aversion : 0
	mzxid : 11396
Set data to node [/hifreud/sayhi] data : hi freud again!
Read from node after change [/hifreud/sayhi] data : hi freud again!
	version : 1
	czxid : 11396
	aversion : 0
	mzxid : 11398
Delete node [/hifreud/sayhello].
Delete node [/hifreud] use recursion.
Server closed...
{% endhighlight %}

方法列表
-------------------

> 摘录自curator官网[framework-method](http://curator.apache.org/curator-framework/index.html)

| create()		| Begins a create operation. Call additional methods (mode or background) and finalize the operation by calling forPath() |
| delete()		| Begins a delete operation. Call additional methods (version or background) and finalize the operation by calling forPath() |
| checkExists()	| Begins an operation to check that a ZNode exists. Call additional methods (watch or background) and finalize the operation by calling forPath() |
| getData()		| Begins an operation to get a ZNode's data. Call additional methods (watch, background or get stat) and finalize the operation by calling forPath() |
| setData()		| Begins an operation to set a ZNode's data. Call additional methods (version or background) and finalize the operation by calling forPath() |
| getChildren()	| Begins an operation to get a ZNode's list of children ZNodes. Call additional methods (watch, background or get stat) and finalize the operation by calling forPath() |
| transactionOp()| Used to allocate operations to be used with transaction(). |
| transaction()	| Atomically submit a set of operations as a transaction. |
| getACL()		| Begins an operation to return a ZNode's ACL settings. Call additional methods and finalize the operation by calling forPath() |
| setACL()		| Begins an operation to set a ZNode's ACL settings. Call additional methods and finalize the operation by calling forPath() |
| getConfig()	| Begins an operation to return the last committed configuration. Call additional methods and finalize the operation by calling forEnsemble() |
| reconfig()	| Begins an operation to change the configuration. Call additional methods and finalize the operation by calling forEnsemble() |

事件类型列表
------------------

> 摘录自curator官网[framework-CuratorEvent](http://curator.apache.org/curator-framework/index.html)

| Event Type	| Event Methods												|
| CREATE		| getResultCode() and getPath()								|
| DELETE		| getResultCode() and getPath()								|
| EXISTS		| getResultCode(), getPath() and getStat()					|
| GET_DATA		| getResultCode(), getPath(), getStat() and getData()		|
| SET_DATA		| getResultCode(), getPath() and getStat()					|
| CHILDREN		| getResultCode(), getPath(), getStat(), getChildren()		|
| SYNC			| getResultCode(), getStat()								|
| GET_ACL		| getResultCode(), getACLList()								|
| SET_ACL		| getResultCode()											|
| TRANSACTION	| getResultCode(), getOpResults()							|
| WATCHED		| getWatchedEvent()											|
| GET_CONFIG	| getResultCode(), getData()								|
| RECONFIG		| getResultCode(), getData()								|


参考资料
=======================================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)

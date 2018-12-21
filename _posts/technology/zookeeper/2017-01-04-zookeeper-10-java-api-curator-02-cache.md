---
layout:			post
title:			Zookeeper之(十) - zookeeper java API - curator - 02 - 监听API
date:			2017-01-12 14:26:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


简介
=======================================

Zookeeper原生支持通过注册Watcher来进行事件监听，但是其使用并不是特别方便，需要开发人员自己反复注册Watcher，比较繁琐。Curator引入了Cache来实现对Zookeeper服务端事件的监听。Cache是Curator中对事件监听的包装，其对事件的监听其实可以近似看作是一个本地缓存视图和远程Zookeeper视图的对比过程。同时Curator能够自动为开发人员处理反复注册监听，从而大大简化了原生API开发的繁琐过程。


PathCache
=======================================

A Path Cache is used to watch a ZNode. Whenever a child is added, updated or removed, the Path Cache will change its state to contain the current set of children, the children's data and the children's state. Path caches in the Curator Framework are provided by the PathChildrenCache class. Changes to the path are passed to registered PathChildrenCacheListener instances.

> PathChildrenCache只能监听到一级子节点的CREATE, UPDATE, DELETE操作。

示例
--------------

{% highlight java %}
package com.freud.zk.curator;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.PathChildrenCache;
import org.apache.curator.framework.recipes.cache.PathChildrenCacheEvent;
import org.apache.curator.framework.recipes.cache.PathChildrenCacheListener;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.zookeeper.CreateMode;

/**
 * 
 * Zookeeper - Curator - PathCache子节点增删改事件监听
 * 
 * @author Freud
 *
 */
public class CuratorListenerPathCacheZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {

		// 节点
		String root = "/hifreud";
		String path = root + "/sayhi";
		String path2 = root + "/sayhello";
		String data = "hi freud";
		String dataAgain = "hi freud again!";

		// Fluent风格创建
		CuratorFramework client = null;
		PathChildrenCache pathCache = null;

		try {
			client = new CuratorListenerPathCacheZookeeper().getStartedClient();

			// PathCache 监听
			pathCache = new PathChildrenCache(client, root, true);
			pathCache.start();
			pathCache.getListenable().addListener(new PathChildrenCacheListener() {

				public void childEvent(CuratorFramework cf, PathChildrenCacheEvent event) throws Exception {
					switch (event.getType()) {
					case INITIALIZED:
					case CONNECTION_RECONNECTED:
					case CONNECTION_SUSPENDED:
					case CONNECTION_LOST:
						System.out.println("[Callback]Event [" + event.getType().toString() + "] ");
						break;
					case CHILD_ADDED:
					case CHILD_REMOVED:
					case CHILD_UPDATED:
						System.out.println("[Callback]Event [" + event.getType().toString() + "] Path ["
								+ event.getData().getPath() + "] data change to :"
								+ new String(event.getData().getData()));
						break;
					default:
						System.out.println("[Callback]Event [Error] ");
						break;
					}

				}
			});
			System.out.println("Listener added success...");

			Thread.sleep(1 * SECOND);
			if (client.checkExists().forPath(path) == null) {
				// 创建节点
				client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT)
						.forPath(path, data.getBytes());
				System.out.println("Created node [" + path + "] with data [" + data + "]");
			}

			Thread.sleep(1 * SECOND);
			if (client.checkExists().forPath(path2) == null) {
				// 创建节点
				client.create().withMode(CreateMode.PERSISTENT).forPath(path2, data.getBytes());
				System.out.println("Created node [" + path2 + "] with data [" + data + "]");
			}

			Thread.sleep(1 * SECOND);
			if (client.checkExists().forPath(path) != null) {
				// 设置节点内容
				client.setData().forPath(path, dataAgain.getBytes());
				System.out.println("Set data to node [" + path + "] data : " + dataAgain);
			}

			Thread.sleep(1 * SECOND);
			if (client.checkExists().forPath(path2) != null) {
				// 强制删除节点
				client.delete().guaranteed().forPath(path2);
				System.out.println("Delete node [" + path2 + "].");
			}

			Thread.sleep(1 * SECOND);
			if (client.checkExists().forPath(root) != null) {
				// 递归删除节点
				client.delete().deletingChildrenIfNeeded().forPath(root);
				System.out.println("Delete node [" + root + "] use recursion.");
			}

		} finally {
			Thread.sleep(2 * SECOND);
			if (pathCache != null) {
				pathCache.close();
			}
			if (client != null) {
				client.close();
			}
			System.out.println("Server closed...");
		}
	}

	private CuratorFramework getStartedClient() {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
---------------

{% highlight text %}
Server connected...
Listener added success...
[Callback]Event [CONNECTION_RECONNECTED] 
Created node [/hifreud/sayhi] with data [hi freud]
[Callback]Event [CHILD_ADDED] Path [/hifreud/sayhi] data change to :hi freud
Created node [/hifreud/sayhello] with data [hi freud]
[Callback]Event [CHILD_ADDED] Path [/hifreud/sayhello] data change to :hi freud
Set data to node [/hifreud/sayhi] data : hi freud again!
[Callback]Event [CHILD_UPDATED] Path [/hifreud/sayhi] data change to :hi freud again!
[Callback]Event [CHILD_REMOVED] Path [/hifreud/sayhello] data change to :hi freud
Delete node [/hifreud/sayhello].
[Callback]Event [CHILD_REMOVED] Path [/hifreud/sayhi] data change to :hi freud again!
Delete node [/hifreud] use recursion.
Server closed...
{% endhighlight %}


NodeCache
=======================================

A utility that attempts to keep the data from a node locally cached. This class will watch the node, respond to update/create/delete events, pull down the data, etc. You can register a listener that will get notified when changes occur.

> NodeCache只能监听到本节点的CREATE, UPDATE, DELETE操作

示例：
---------------

{% highlight java %}
package com.freud.zk.curator;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.NodeCache;
import org.apache.curator.framework.recipes.cache.NodeCacheListener;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.zookeeper.CreateMode;

/**
 * 
 * Zookeeper - Curator - NodeCache
 * 
 * @author Freud
 *
 */
public class CuratorListenerNodeCacheZookeeper {

	private static final int SECOND = 1000;

	// 节点
	public String root = "/hifreud";
	public String data = "hi freud";
	public String dataAgain = "hi freud again!";

	public static void main(String[] args) throws Exception {

		final CuratorListenerNodeCacheZookeeper instance = new CuratorListenerNodeCacheZookeeper();
		CuratorFramework client = instance.getStartedClient();

		// NodeCache 监听
		final NodeCache nodeCache = new NodeCache(client, instance.root);
		nodeCache.start(true);
		nodeCache.getListenable().addListener(new NodeCacheListener() {
			public void nodeChanged() throws Exception {
				System.out.println("[Callback] Node path [" + instance.root + "] data : "
						+ (nodeCache.getCurrentData() == null ? null : new String(nodeCache.getCurrentData().getData())));
			}
		});

		System.out.println("Listener added success...");

		instance.operations(client);

		Thread.sleep(2 * SECOND);
		if (nodeCache != null) {
			nodeCache.close();
		}
		if (client != null) {
			client.close();
		}
		System.out.println("Server closed...");
	}

	private void operations(CuratorFramework client) throws Exception {
		Thread.sleep(1 * SECOND);
		if (client.checkExists().forPath(root) == null) {
			// 创建节点
			client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(root, data.getBytes());
			System.out.println("Created node [" + root + "] with data [" + data + "]");
		}

		Thread.sleep(1 * SECOND);
		if (client.checkExists().forPath(root) != null) {
			// 设置节点内容
			client.setData().forPath(root, dataAgain.getBytes());
			System.out.println("Set data to node [" + root + "] data : " + dataAgain);
		}

		Thread.sleep(1 * SECOND);
		if (client.checkExists().forPath(root) != null) {
			// 递归删除节点
			client.delete().deletingChildrenIfNeeded().forPath(root);
			System.out.println("Delete node [" + root + "] use recursion.");
		}
	}

	private CuratorFramework getStartedClient() {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
----------------

{% highlight text %}
Server connected...
Listener added success...
Created node [/hifreud] with data [hi freud]
[Callback] Node path [/hifreud] data : hi freud
Set data to node [/hifreud] data : hi freud again!
[Callback] Node path [/hifreud] data : hi freud again!
Delete node [/hifreud] use recursion.
[Callback] Node path [/hifreud] data : null
Server closed...
{% endhighlight %}


TreeCache
=======================================

A utility that attempts to keep all data from all children of a ZK path locally cached. This class will watch the ZK path, respond to update/create/delete events, pull down the data, etc. You can register a listener that will get notified when changes occur.

> TreeCache可以监听到本节点及其所有子节点树的CREATE, UPDATE, DELETE操作

示例
----------------

{% highlight java %}
package com.freud.zk.curator;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.TreeCache;
import org.apache.curator.framework.recipes.cache.TreeCacheEvent;
import org.apache.curator.framework.recipes.cache.TreeCacheListener;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.zookeeper.CreateMode;

/**
 * 
 * Zookeeper - Curator - TreeCache
 * 
 * @author Freud
 *
 */
public class CuratorListenerTreeCacheZookeeper {

	private static final int SECOND = 1000;

	// 节点
	public String root = "/hifreud";
	public String path = root + "/sayhi";
	public String path2 = path + "/sayhello";
	public String data = "hi freud";
	public String dataAgain = "hi freud again!";

	public static void main(String[] args) throws Exception {

		final CuratorListenerTreeCacheZookeeper instance = new CuratorListenerTreeCacheZookeeper();
		CuratorFramework client = instance.getStartedClient();

		// TreeCache 监听
		final TreeCache treeCache = new TreeCache(client, instance.root);
		treeCache.start();
		treeCache.getListenable().addListener(new TreeCacheListener() {
			public void childEvent(CuratorFramework cf, TreeCacheEvent event) throws Exception {
				switch (event.getType()) {
				case INITIALIZED:
				case CONNECTION_LOST:
				case CONNECTION_RECONNECTED:
				case CONNECTION_SUSPENDED:
					System.out.println("[Callback]Event [" + event.getType().toString() + "] ");
					break;
				case NODE_ADDED:
				case NODE_UPDATED:
				case NODE_REMOVED:
					System.out.println("[Callback]Event [" + event.getType().toString() + "] Path ["
							+ event.getData().getPath() + "] data change to :" + new String(event.getData().getData()));
					break;
				default:
					System.out.println("[Callback]Event [Error] ");
					break;
				}
			}
		});

		System.out.println("Listener added success...");

		instance.operations(client);

		Thread.sleep(2 * SECOND);
		if (treeCache != null) {
			treeCache.close();
		}
		if (client != null) {
			client.close();
		}
		System.out.println("Server closed...");
	}

	private void operations(CuratorFramework client) throws Exception {
		Thread.sleep(1 * SECOND);
		if (client.checkExists().forPath(path) == null) {
			// 创建节点
			client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(path, data.getBytes());
			System.out.println("Created node [" + path + "] with data [" + data + "]");
		}

		Thread.sleep(1 * SECOND);
		if (client.checkExists().forPath(path2) == null) {
			// 创建节点
			client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(path2, data.getBytes());
			System.out.println("Created node [" + path2 + "] with data [" + data + "]");
		}

		Thread.sleep(1 * SECOND);
		if (client.checkExists().forPath(path) != null) {
			// 设置节点内容
			client.setData().forPath(path, dataAgain.getBytes());
			System.out.println("Set data to node [" + path + "] data : " + dataAgain);
		}

		Thread.sleep(1 * SECOND);
		if (client.checkExists().forPath(root) != null) {
			// 递归删除节点
			client.delete().deletingChildrenIfNeeded().forPath(root);
			System.out.println("Delete node [" + root + "] use recursion.");
		}
	}

	private CuratorFramework getStartedClient() {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
----------------

{% highlight text %}
Server connected...
Listener added success...
[Callback]Event [INITIALIZED] 
[Callback]Event [NODE_ADDED] Path [/hifreud] data change to :
Created node [/hifreud/sayhi] with data [hi freud]
[Callback]Event [NODE_ADDED] Path [/hifreud/sayhi] data change to :hi freud
Created node [/hifreud/sayhi/sayhello] with data [hi freud]
[Callback]Event [NODE_ADDED] Path [/hifreud/sayhi/sayhello] data change to :hi freud
Set data to node [/hifreud/sayhi] data : hi freud again!
[Callback]Event [NODE_UPDATED] Path [/hifreud/sayhi] data change to :hi freud again!
[Callback]Event [NODE_REMOVED] Path [/hifreud/sayhi/sayhello] data change to :hi freud
[Callback]Event [NODE_REMOVED] Path [/hifreud/sayhi] data change to :hi freud again!
[Callback]Event [NODE_REMOVED] Path [/hifreud] data change to :
Delete node [/hifreud] use recursion.
Server closed...
{% endhighlight %}


参考资料
=======================================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)

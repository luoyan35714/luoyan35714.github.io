---
layout:			post
title:			Zookeeper之(十六) - zookeeper java API - curator - 08 - 常用工具
date:			2017-01-18 14:54:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


ZKPaths
=====================

ZkPaths提供了一些简单的API来构建Znode的路径，递归创建和删除节点等。

| getNodeFromPath 	| Given a full path, return the node name. i.e. "/one/two/three" will return "three" 	|
| mkdirs 			| Make sure all the nodes in the path are created.										|
| getSortedChildren | Return the children of the given path sorted by sequence number 						|
| makePath 			| Given a parent path and a child node, create a combined full path 					|

{% highlight java %}
package com.freud.zk.curator;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.curator.utils.ZKPaths;
import org.apache.curator.utils.ZKPaths.PathAndNode;
import org.apache.zookeeper.ZooKeeper;

/**
 * 
 * Zookeeper - Curator - Utils - ZKPaths
 * 
 * @author Freud
 *
 */
public class CuratorUtilsZKPathsZookeeper {

	private static final int SECOND = 1000;
	private static final String root = "/curator_utils";
	private static final String path = "/zkpaths";

	public static void main(String[] args) throws Exception {
		// 获取Curator客户端
		CuratorFramework client = new CuratorUtilsZKPathsZookeeper().getStartedClient();
		// 获取Zookeeper客户端
		ZooKeeper zk = client.getZookeeperClient().getZooKeeper();

		System.out.println(ZKPaths.fixForNamespace(root, path));
		// 创建节点
		System.out.println(ZKPaths.makePath(root, path));
		// 获取节点
		System.out.println(ZKPaths.getNodeFromPath(root + path));

		// 获取节点
		PathAndNode pn = ZKPaths.getPathAndNode(root + path);
		System.out.println(pn.getPath());
		System.out.println(pn.getNode());

		String dir1 = root + path + "/dir1";
		String dir2 = root + path + "/dir2";

		// 创建路径集合
		ZKPaths.mkdirs(zk, dir1);
		ZKPaths.mkdirs(zk, dir2);

		System.out.println(ZKPaths.getSortedChildren(zk, root + path));

		// 删除所有子节点
		ZKPaths.deleteChildren(zk, root, true);

		client.close();
		System.out.println("Server closed...");
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


QueueSharder
=====================

Due to limitations in ZooKeeper's transport layer, a single queue will break if it has more than 10K-ish items in it. This class provides a facade over multiple distributed queues. It monitors the queues and if any one of them goes over a threshold, a new queue is added. Puts are distributed amongst the queues.

{% highlight java %}
{% endhighlight %}


参考资料
=====================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)

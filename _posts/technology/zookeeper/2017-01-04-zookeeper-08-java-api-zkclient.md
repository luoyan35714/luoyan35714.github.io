---
layout:			post
title:			Zookeeper学习笔记之(八) - zookeeper java API - zkclient
date:			2017-01-11 14:23:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


ZkClient
=======================================

简介
-----------------

ZkClient是Github上一个开源的Zookeeper客户端，是由Datameer的工程师Stefan Groschupf和Peter Voss一起开发的。ZkClient在Zookeeper原生API接口之上进行了包装，是一个更易用的Zookeeper客户端。同时ZkClient在内部实现了诸如Session超时重连，Watcher反复注册等功能。使得Zookeeper客户端这些繁琐的细节工作对开发人员透明。

Maven依赖
-----------------

{% highlight xml %}
<dependency>
	<groupId>com.101tec</groupId>
	<artifactId>zkclient</artifactId>
	<version>0.2</version>
</dependency>
{% endhighlight %}

示例内容
-----------------

+ 创建连接，如下创建连接有很构造函数和参数，大多数从字面意思比较好理解，重点说下serverString和zkServers，其代表的是`host:port,host:port,...,...`，并且图中1和2的API是一致的，其中1底层也是通过创建ZkConnection来实现的。

![/images/blog/zookeeper/08-java-api-zkclient/01-create-connections.png](/images/blog/zookeeper/08-java-api-zkclient/01-create-connections.png)

+ 检测节点是否存在
+ 创建节点
+ 创建子节点
+ 获取节点内容
+ 获取所有子节点
+ 修改节点内容
+ 递归删除节点

代码
-----------------

{% highlight java %}
package com.freud.zk.zkclient;

import java.util.Arrays;
import java.util.List;

import org.I0Itec.zkclient.IZkChildListener;
import org.I0Itec.zkclient.IZkDataListener;
import org.I0Itec.zkclient.IZkStateListener;
import org.I0Itec.zkclient.ZkClient;
import org.apache.zookeeper.Watcher.Event.KeeperState;

/**
 * 
 * Zookeeper - ZkClient
 * 
 * @author Freud
 *
 */
public class ZkClientZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {

		ZkClient zk = new ZkClient("localhost:2181", 5 * SECOND);

		System.out.println("Server connected...");

		String root = "/hifreud";
		String path = root + "/sayhi";
		String path2 = root + "/sayhello";

		Thread.sleep(1 * SECOND);
		// 添加服务器状态监听
		zk.subscribeStateChanges(new ZkStateListener());
		// 添加子节点状态监听->将监听创建，减少，删除子节点状态
		zk.subscribeChildChanges(root, new ZkChildListener());
		// 为各个节点添加数据状态监听
		zk.subscribeDataChanges(root, new ZkDataListener());
		zk.subscribeDataChanges(path, new ZkDataListener());
		zk.subscribeDataChanges(path2, new ZkDataListener());
		System.out.println("Listener added...");

		Thread.sleep(1 * SECOND);

		boolean exist = zk.exists(path);
		if (!exist) {
			System.out.println("Create node : " + path);
			// 递归创建节点
			zk.createPersistent(path, true);
		}

		Thread.sleep(1 * SECOND);
		exist = zk.exists(path2);
		if (!exist) {
			System.out.println("Create node : " + path2);
			// 递归创建节点
			zk.createPersistent(path2, true);
		}

		Thread.sleep(1 * SECOND);
		exist = zk.exists(path);
		if (exist) {
			// 向节点添加数据
			String data = "say hi!";
			System.out.println("Write data to node " + path + " : " + data);
			zk.writeData(path, data);
		}

		Thread.sleep(1 * SECOND);
		exist = zk.exists(path);
		if (exist) {
			// 获取节点数据
			Object data = zk.readData(path);
			System.out.println("Read data from node " + path + " : " + data);
		}

		Thread.sleep(1 * SECOND);
		exist = zk.exists(path);
		if (exist) {
			// 获取所有子节点
			List<String> children = zk.getChildren(root);
			System.out.println("Get all children from node " + root + " : "
					+ ((children == null || children.isEmpty()) ? "[]" : Arrays.toString(children.toArray())));
		}

		Thread.sleep(1 * SECOND);
		exist = zk.exists(root);
		if (exist) {
			System.out.println("Delete node : " + root);
			// 递归删除节点
			zk.deleteRecursive(root);
		}

		Thread.sleep(2 * SECOND);
		// 关闭连接
		zk.close();

		System.out.println("Server closeed...");
	}
}

class ZkStateListener implements IZkStateListener {

	/**
	 * 服务端起停操作触发
	 */
	@SuppressWarnings("deprecation")
	@Override
	public void handleStateChanged(KeeperState state) throws Exception {
		String stateStr = null;
		switch (state) {
		case Disconnected:
			stateStr = "Disconnected";
			break;
		case Expired:
			stateStr = "Expired";
			break;
		case NoSyncConnected:
			stateStr = "NoSyncConnected";
			break;
		case SyncConnected:
			stateStr = "SyncConnected";
			break;
		case Unknown:
		default:
			stateStr = "Unknow";
			break;
		}
		System.out.println("[Callback]State changed to [" + stateStr + "]");
	}

	@Override
	public void handleNewSession() throws Exception {
		System.out.println("[Callback]New session created..");
	}
}

class ZkDataListener implements IZkDataListener {

	@Override
	public void handleDataChange(String dataPath, Object data) throws Exception {
		System.out.println("[Callback]Node data changed to (" + dataPath + ", " + data + "]");
	}

	@Override
	public void handleDataDeleted(String dataPath) throws Exception {
		System.out.println("[Callback]Delete node (" + dataPath + ")");
	}
}

class ZkChildListener implements IZkChildListener {
	@Override
	public void handleChildChange(String parentPath, List<String> currentChilds) throws Exception {
		System.out
				.println("[Callback]Child path changed, root("
						+ parentPath
						+ "), changed to "
						+ ((currentChilds == null || currentChilds.isEmpty()) ? "[]" : Arrays.toString(currentChilds
								.toArray())));
	}
}
{% endhighlight %}

打印结果
-----------------

{% highlight text %}
Server connected...
Listener added...
Create node : /hifreud/sayhi
[Callback]Child path changed, root(/hifreud), changed to [sayhi]
[Callback]Node data changed to (/hifreud, null]
[Callback]Node data changed to (/hifreud/sayhi, null]
Create node : /hifreud/sayhello
[Callback]Node data changed to (/hifreud/sayhello, null]
[Callback]Child path changed, root(/hifreud), changed to [sayhi, sayhello]
Write data to node /hifreud/sayhi : say hi!
[Callback]Node data changed to (/hifreud/sayhi, say hi!]
Read data from node /hifreud/sayhi : say hi!
Get all children from node /hifreud : [sayhi, sayhello]
Delete node : /hifreud
[Callback]Delete node (/hifreud/sayhi)
[Callback]Child path changed, root(/hifreud), changed to []
[Callback]Delete node (/hifreud/sayhello)
[Callback]Child path changed, root(/hifreud), changed to []
[Callback]Delete node (/hifreud)
Server closeed...
{% endhighlight %}


参考资料
=======================================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

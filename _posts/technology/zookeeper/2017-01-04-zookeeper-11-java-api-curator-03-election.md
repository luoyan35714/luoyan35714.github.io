---
layout:			post
title:			Zookeeper学习笔记之(十一) - zookeeper java API - curator - 03 - 选举API
date:			2017-01-13 14:26:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


Curator高级API - Master选举
=======================================

在分布式系统中，经常会碰到这样的场景：对于一个复杂的任务，仅需要从集群中选举出一台进行处理即可。称为'Master选举'问题。借助Zookeeper，可以比较简单的实现Master选举的功能，大体思路如下：

> 选择一个根节点，例如/master_select,多台机器同事向该节点创建一个子节点/master_select/lock,利用Zookeeper的特性，最终只有一台机器能够创建成功，成功的哪台机器就作为Master。

Curator也是基于这个思路，但是它将节点创建，事件监听和自动选举过程进行了封装，开发人员只需要条用简单的API就可以实现Master选举

Curator实现了两套选举API，分别是LeaderSelector和LeaderLatch。

LeaderSelector
=======================================

> LeaderSelector支持任务执行完成之后自动重新竞选。针对单个任务在集群中竞争执行，只允许一台服务器执行场景。

示例代码
-----------------

{% highlight java %}
package com.freud.zk.curator;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.leader.LeaderSelector;
import org.apache.curator.framework.recipes.leader.LeaderSelectorListener;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Leader Election
 * 
 * @author Freud
 *
 */
public class CuratorLeaderElectionZookeeper {

	private static final int SECOND = 1000;
	private static int count = 1;

	public static void main(String[] args) throws Exception {
		ExecutorService service = Executors.newFixedThreadPool(3);
		for (int i = 0; i < 3; i++) {
			final int index = i;
			service.submit(new Runnable() {
				public void run() {
					try {
						new CuratorLeaderElectionZookeeper().schedule(index);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			});
		}

		Thread.sleep(10 * SECOND);
		service.shutdownNow();
	}

	private void schedule(final int thread) throws Exception {
		CuratorFramework client = this.getStartedClient(thread);
		String path = "/leader_selector";
		if (client.checkExists().forPath(path) == null) {
			client.create().creatingParentsIfNeeded().forPath(path);
		}
		LeaderSelector selector = new LeaderSelector(client, path, new LeaderSelectorListener() {
			public void stateChanged(CuratorFramework cf, ConnectionState state) {
				System.out.println("Thread [" + thread + "][Callback] State changed to :" + state.name());
			}

			public void takeLeadership(CuratorFramework cf) throws Exception {
				Thread.sleep(1 * SECOND);
				System.out.println("Thread [" + thread + "]Do some business work...timestamp ["
						+ System.currentTimeMillis() + "] times [" + count++ + "]");
			}
		});

		// 自动重新部署竞选
		selector.autoRequeue();
		selector.start();
	}

	private CuratorFramework getStartedClient(final int thread) {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Thread [" + thread + "]Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
----------------------

{% highlight text %}
Thread [1]Server connected...
Thread [2]Server connected...
Thread [0]Server connected...
Thread [0]Do some business work...timestamp [1484621709106] times [1]
Thread [1]Do some business work...timestamp [1484621710198] times [2]
Thread [2]Do some business work...timestamp [1484621711329] times [3]
Thread [0]Do some business work...timestamp [1484621712396] times [4]
Thread [1]Do some business work...timestamp [1484621713438] times [5]
Thread [2]Do some business work...timestamp [1484621714586] times [6]
Thread [0]Do some business work...timestamp [1484621715688] times [7]
Thread [1]Do some business work...timestamp [1484621716725] times [8]
{% endhighlight %}

> 观察结果之后发现在相同的秒数内只有一个Server执行了打印输出。


LeaderLatch
=======================================

> LeaderLatch支持针对竞选失败情况下的操作。并且选出的Master将为长期保持Master状态，在Master节点挂掉之后，会马上在集群中选出新的Master节点。

示例代码
-----------------

{% highlight java %}
package com.freud.zk.curator;

import java.text.MessageFormat;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.leader.LeaderLatch;
import org.apache.curator.framework.recipes.leader.LeaderLatchListener;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Leader Latch
 * 
 * @author Freud
 *
 */
public class CuratorLeaderLatchZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {
		ExecutorService service = Executors.newFixedThreadPool(3);
		for (int i = 0; i < 3; i++) {
			final int index = i;
			service.submit(new Runnable() {
				public void run() {
					try {
						new CuratorLeaderLatchZookeeper().schedule(index);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			});
		}

		Thread.sleep(10 * SECOND);
		service.shutdownNow();
	}

	private void schedule(final int thread) throws Exception {
		CuratorFramework client = this.getStartedClient(thread);
		String path = "/leader_latch";
		if (client.checkExists().forPath(path) == null) {
			client.create().creatingParentsIfNeeded().forPath(path);
		}

		LeaderLatch latch = new LeaderLatch(client, path);
		latch.addListener(new LeaderLatchListener() {

			public void notLeader() {
				System.out.println(MessageFormat.format("Thread [" + thread
						+ "] I am not the leader... timestamp [{0}]", System.currentTimeMillis()));
			}

			public void isLeader() {
				System.out.println(MessageFormat.format("Thread [" + thread + "] I am the leader... timestamp [{0}]",
						System.currentTimeMillis()));
			}
		});

		latch.start();

		Thread.sleep(2 * (thread + 1) * SECOND);
		if (latch != null) {
			latch.close();
		}
		if (client != null) {
			client.close();
		}
		System.out.println("Thread [" + thread + "] Server closed...");
	}

	private CuratorFramework getStartedClient(final int thread) {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Thread [" + thread + "] Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

连续启动三次之后输出结果如下

打印结果
----------------------

{% highlight text %}
Thread [1] Server connected...
Thread [0] Server connected...
Thread [2] Server connected...
Thread [0] I am the leader... timestamp [1,484,622,048,539]
Thread [0] Server closed...
Thread [1] I am the leader... timestamp [1,484,622,050,431]
Thread [2] I am the leader... timestamp [1,484,622,052,427]
Thread [1] Server closed...
Thread [2] Server closed...
{% endhighlight %}

> 观察结果之后发现在Master节点挂掉之后，会马上重新选举一个新的Master出来。


参考资料
=======================================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)

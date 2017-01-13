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
public class CuratorLeaserElectionZookeeper {

	private static final int SECOND = 1000;
	private static int count = 1;

	public static void main(String[] args) throws Exception {

		final CuratorLeaserElectionZookeeper instance = new CuratorLeaserElectionZookeeper();
		CuratorFramework client = instance.getStartedClient();
		String path = "/leader_selector";
		if (client.checkExists().forPath(path) == null) {
			client.create().creatingParentsIfNeeded().forPath(path);
		}

		LeaderSelector selector = new LeaderSelector(client, path, new LeaderSelectorListener() {
			public void stateChanged(CuratorFramework cf, ConnectionState state) {
				System.out.println("[Callback] State changed to :" + state.name());
			}

			public void takeLeadership(CuratorFramework cf) throws Exception {
				Thread.sleep(1 * SECOND);
				System.out.println("Do some business work...timestamp [" + System.currentTimeMillis() + "] times ["
						+ count++ + "]");
			}
		});

		// 自动重新部署竞选
		selector.autoRequeue();
		selector.start();

		Thread.sleep(10 * SECOND);
		if (client != null) {
			client.close();
		}
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

连续启动三次之后输出结果如下

打印结果一
----------------------

{% highlight text %}
Server connected...
Do some business work...timestamp [1484297959468] times [1]
Do some business work...timestamp [1484297961764] times [2]
Do some business work...timestamp [1484297965066] times [3]
Do some business work...timestamp [1484297968279] times [4]
Server closed...
{% endhighlight %}

打印结果二
----------------------

{% highlight text %}
Server connected...
Do some business work...timestamp [1484297960635] times [1]
Do some business work...timestamp [1484297964003] times [2]
Do some business work...timestamp [1484297967167] times [3]
Server closed...
{% endhighlight %}

打印结果三
----------------------

{% highlight text %}
Server connected...
Do some business work...timestamp [1484297962870] times [1]
Do some business work...timestamp [1484297966115] times [2]
Do some business work...timestamp [1484297969404] times [3]
Server closed...
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
public class CuratorLeaserLatchZookeeper {

	private static final int SECOND = 1000;
	private static int count = 1;

	public static void main(String[] args) throws Exception {

		final CuratorLeaserLatchZookeeper instance = new CuratorLeaserLatchZookeeper();
		CuratorFramework client = instance.getStartedClient();
		String path = "/leader_latch";
		if (client.checkExists().forPath(path) == null) {
			client.create().creatingParentsIfNeeded().forPath(path);
		}

		LeaderLatch latch = new LeaderLatch(client, path);
		latch.addListener(new LeaderLatchListener() {

			public void notLeader() {
				System.out.println(MessageFormat.format("I am not the leader... timestamp [{0}]",
						System.currentTimeMillis()));
			}

			public void isLeader() {
				System.out.println(MessageFormat.format("I am the leader... timestamp [{0}]",
						System.currentTimeMillis()));
			}
		});

		latch.start();

		Thread.sleep(5 * SECOND);
		if (latch != null) {
			latch.close();
		}
		if (client != null) {
			client.close();
		}
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

连续启动三次之后输出结果如下

打印结果一
----------------------

{% highlight text %}
Server connected...
I am the leader... timestamp [1,484,298,352,265]
Server closed...
{% endhighlight %}

打印结果二
----------------------

{% highlight text %}
Server connected...
I am the leader... timestamp [1,484,298,356,989]
Server closed...
{% endhighlight %}

打印结果三
----------------------

{% highlight text %}
Server connected...
I am the leader... timestamp [1,484,298,357,848]
Server closed...
{% endhighlight %}

> 观察结果之后发现在Master节点挂掉之后，会马上重新选举一个新的Master出来。


参考资料
=======================================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)
